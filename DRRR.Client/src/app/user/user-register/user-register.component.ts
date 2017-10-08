import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import swal from 'sweetalert2';

import { Subscription } from 'rxjs/Subscription';

import { SystemMessagesService } from '../../core/services/system-messages.service';
import { UserRegisterService } from './user-register.service';
import { FormErrorsAutoClearer } from '../../core/services/form-errors-auto-clearer.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit, OnDestroy {

  registerForm: FormGroup;

  formErrorMessages: object;

  requiredValidationMessages: { [key: string]: Function };

  private isValidatingAsync: boolean;

  private isWaitingToRegister: boolean;

  private controlsValueChanges: Subscription[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private msg: SystemMessagesService,
    private registerService: UserRegisterService,
    private autoClearer: FormErrorsAutoClearer,
    private auth: AuthService) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(128)]],
      confirmPassword: ['', Validators.required]
    });

    this.formErrorMessages = {};

    this.requiredValidationMessages = {
      username: () => this.msg.getMessage('E001', '用户名'),
      password: () => this.msg.getMessage ('E001', '密码'),
      confirmPassword: () => this.msg.getMessage('E001', '确认密码')
    };
    this.controlsValueChanges = this.autoClearer.register(this.registerForm, this.formErrorMessages);
  }

  ngOnDestroy () {
    this.controlsValueChanges.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * 验证用户名是否合法
   * @param {AbstractControl} username 用户名
   */
  validateUsername(username: AbstractControl) {
    // 以防先走这个方法，所以加上trim
    if (username.value.trim() && !this.formErrorMessages['username']) {
      if (username.hasError('minlength')
        || username.hasError('maxlength')) {
        this.formErrorMessages['username'] = this.msg.getMessage('E002', '2', '10', '用户名');
        return;
      }

      this.isValidatingAsync = true;
      this.registerService
        .validateUsername(username.value)
        .subscribe(res => {
          this.isValidatingAsync = false;

          if (this.formErrorMessages['username'] = res.error) {
            username.setErrors({illegal: !!res.error});
          }

          if (this.isWaitingToRegister) {
            // 如果在后台验证结果尚未回来之前，用户点击了注册
            // 则在这里继续被中断的注册处理
            this.register(this.registerForm.value);
          }
        });
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
   * 点击注册
   * @param {Object} data
   */
  register(registerInfo: object) {
    // 如果存在异步验证，则稍后进行注册
    if (this.isValidatingAsync) {
      this.isWaitingToRegister = true;
      return;
    }else {
      this.isWaitingToRegister = false;
    }

    // 用户有可能直接就按注册键，这边的处理并非是多余的
    for (const controlName of Object.keys(this.registerForm.controls)) {
      this.validateRequired(controlName);
    }
    // 确认密码被输入时才验证确认密码
    if (registerInfo['confirmPassword'] && registerInfo['password'] !== registerInfo['confirmPassword']) {
      this.formErrorMessages['confirmPassword'] = this.msg.getMessage('E003', '密码');
      return;
    }
    if (this.registerForm.valid) {
      this.msg.showLoadingMessage('I005', '登录');

      this.registerService.register(registerInfo)
        .subscribe(res => {
          this.msg.closeLoadingMessage();

          if (!res.error) {
            this.auth.saveAccessToken(res.accessToken);
            this.auth.saveRefreshToken(res.refreshToken);
            swal(this.msg.getMessage('I001', '注册'), '', 'success')
              .then(() => {
                this.router.navigate(['/rooms']);
                this.msg.showAutoCloseMessage('success', 'I001', '登录');
              });
          } else {
            // 用户名不符合规范，或者用户名重复
            this.formErrorMessages['username'] = res.error;
            this.registerForm.controls['username'].setErrors({illegal: true});
          }
        }, error => {
          swal(this.msg.getMessage('E004', '注册'),
            this.msg.getMessage('E010'), 'error')
            .then(() => {}, () => {});
        });
    }
  }

  /**
   * 验证是否被输入并显示错误
   * @param {string} controlName 控件名
   */
  validateRequired(controlName: string) {
    if (!this.registerForm.controls[controlName].value.trim()) {
      this.formErrorMessages[controlName] = this.requiredValidationMessages[controlName]();
    }
  }
}
