import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import swal from 'sweetalert2';

import { Subscription } from 'rxjs/Subscription'

import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { SystemMessagesService } from '../../core/services/system-messages.service';
import { FormErrorsAutoClearer } from '../../core/services/form-errors-auto-clearer.service';
import { ChatRoomDto } from '../dtos/chat-room.dto'
import { ChatRoomCreateService } from './chat-room-create.service';
import set = Reflect.set;

@Component({
  selector: 'app-chat-room-create',
  templateUrl: './chat-room-create.component.html',
  styleUrls: ['./chat-room-create.component.css']
})
export class ChatRoomCreateComponent implements OnInit, OnDestroy {

  form: FormGroup;

  formErrorMessages: object;

  private requiredValidationMessages: { [key: string]: Function };

  private isValidatingAsync: boolean;

  private isWaitingToCreate: boolean;

  private controlsValueChanges: Subscription[];

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private msg: SystemMessagesService,
    private autoClearer: FormErrorsAutoClearer,
    private createService: ChatRoomCreateService,
    private router: Router) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20)]],
      maxUsers: ['2', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.min(2),
        Validators.max(1000)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(128)]],
      isEncrypted: [false],
      isPermanent: [false],
      isHidden: [false]
    });
    this.formErrorMessages = {};

    this.requiredValidationMessages = {
      name: () => this.msg.getMessage('E001', '房间名'),
      maxUsers: () => this.msg.getMessage('E001', '成员人数'),
      password: () => {
        return (this.form.value as ChatRoomDto).isEncrypted ?
          this.msg.getMessage('E001', '密码') : '';
      }
    };

    this.controlsValueChanges = this.autoClearer.register(this.form, this.formErrorMessages);
  }

  ngOnDestroy () {
    this.controlsValueChanges.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * 验证房间名
   * @param {AbstractControl} name 房间名
   */
  validateRoomName(name: AbstractControl) {
    // 以防先走这个方法，所以加上trim
    if (name.value.trim() && !this.formErrorMessages['username']) {
      if (name.hasError('minlength')
        || name.hasError('maxlength')) {
        this.formErrorMessages['name'] = this.msg.getMessage('E002', '2', '20', '房间名');
        return;
      }

      this.isValidatingAsync = true;

      this.createService
        .validateRoomName(name.value)
        .subscribe(res => {
          this.isValidatingAsync = false;

          if (this.formErrorMessages['name'] = res.error) {
            name.setErrors({ illegal: !!res.error });
          }

          if (this.isWaitingToCreate) {
            // 如果在后台验证结果尚未回来之前，用户点击了创建
            // 则在这里继续被中断的创建处理
            this.create();
          }
        });
    }
  }

  /**
   * 验证成员人数
   * @param {AbstractControl} maxUsers 成员人数
   */
  validateMaxUsers(maxUsers: AbstractControl) {
    if (maxUsers.value.trim()) {
      this.formErrorMessages['maxUsers'] = maxUsers.valid ? '' :
        this.msg.getMessage('E005', '2', '1000', '成员人数');
    }
  }

  /**
   * 验证密码输入是否合法
   * @param {AbstractControl} password 密码
   */
  validatePassword(password: AbstractControl) {
    if (password.value.trim()) {
      this.formErrorMessages['password'] = password.valid ? '' :
        this.msg.getMessage('E002', '6', '128', '密码');
    }
  }

  /**
   * 创建房间
   */
  create() {
    // 如果存在异步验证，则稍后进行注册
    if (this.isValidatingAsync) {
      this.isWaitingToCreate = true;
      return;
    } else {
      this.isWaitingToCreate = false;
    }

    for (const controlName of Object.keys(this.form.controls)) {
      this.validateRequired(controlName);
    }

    if (Object.values(this.formErrorMessages).every(error => !error)) {
      this.msg.showLoadingMessage('I005', '创建房间');
      this.createService.createRoom(this.form.value)
        .subscribe(res => {
          this.msg.closeLoadingMessage();
          if (res.error) {
            // 多线程导致的房间名重复
            this.formErrorMessages['name'] = res.error;
            this.form.controls['name'].setErrors({ illegal: true });
          } else {
            this.bsModalRef.hide();
            swal(this.msg.getMessage('I001', '房间创建'), '', 'success')
              .then(() => {
                this.router.navigate(['/rooms', res.roomId]);
              }, () => { });
          }
        }, error => {
          swal(this.msg.getMessage('E004', '房间创建'),
            this.msg.getMessage('E010'), 'error')
            .then(() => { }, () => { });
        });
    }
  }

  /**
   * 通过按下回车创建房间
   * @param {Event} event 事件参数
   */
  createByPressingEnter(event: Event) {
    (<HTMLInputElement>event.target).blur();
    setTimeout(() => this.create());
  }

  /**
   * 验证是否被输入并显示错误
   * @param {string} controlName 控件名
   */
  validateRequired(controlName: string) {
    if (this.requiredValidationMessages[controlName] && !this.form.controls[controlName].value.trim()) {
      this.formErrorMessages[controlName] = this.requiredValidationMessages[controlName]();
    }
  }
}
