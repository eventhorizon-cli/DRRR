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

  captchaId: string;

  captchaUrl: string;

  private isValidatingAsync: boolean;

  private isWaitingToRegister: boolean;

  private controlsValueChanges: Subscription[];

  private isRefreshingCaptch: boolean;

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
      confirmPassword: ['',
        Validators.required],
      captcha: ['',
        Validators.required
      ]
    });

    this.formErrorMessages = {};

    this.requiredValidationMessages = {
      username: () => this.msg.getMessage('E001', '用户名'),
      password: () => this.msg.getMessage('E001', '密码'),
      confirmPassword: () => this.msg.getMessage('E001', '确认密码'),
      captcha: () => this.msg.getMessage('E001', '验证码')
    };
    this.controlsValueChanges = this.autoClearer.register(this.registerForm, this.formErrorMessages);

    // 获取验证码
    this.refreshCaptcha();
  }

  ngOnDestroy() {
    this.controlsValueChanges.forEach(subscription => subscription.unsubscribe());
    this.registerService.disconnect();
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
            // 值改变后，该error会被自动删除
            username.setErrors({ illegal: true });
          }

          if (this.isWaitingToRegister) {
            // 如果在后台验证结果尚未回来之前，用户点击了注册
            // 则在这里继续被中断的注册处理
            this.register(this.registerForm.value);
          }
        });
    } else {
      this.validateRequired('username');
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
    } else {
      this.validateRequired('password');
    }
  }

  /**
   * 点击注册
   * @param {Object} registerInfo 注册信息
   */
  register(registerInfo: object) {
    // 如果存在异步验证，则稍后进行注册
    if (this.isValidatingAsync) {
      this.isWaitingToRegister = true;
      return;
    } else {
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
      this.msg.showLoadingMessage('I005', '注册');

      this.registerService.register({
        username: registerInfo['username'],
        password: registerInfo['password'],
        captchaId: this.captchaId,
        captchaText: registerInfo['captcha']
      }).subscribe(res => {
        this.msg.closeLoadingMessage();

        if (!res.error) {
          this.auth.saveAccessToken(res.accessToken);
          this.auth.saveRefreshToken(res.refreshToken);
          swal(this.msg.getMessage('I001', '注册'), '', 'success')
            .then(() => {
              this.router.navigate(['/rooms']).then(() => {
                this.msg.showAutoCloseMessage('success', 'I001', '登录');
              });
            });
        } else {
          // 验证码错误错误
          // 或者多线程导致的用户名重复
          Object.assign(this.formErrorMessages, res.error);

          // 用户修改输入的内容后会自动去除
          this.registerForm.controls[Object.keys(res.error)[0]].setErrors({ illegal: true });
          this.refreshCaptcha();
        }
      }, () => {
        swal(this.msg.getMessage('E004', '注册'),
          this.msg.getMessage('E010'), 'error');
      });
    }
  }

  /**
   * 通过点击回车进行登录
   * @param {Event} event 事件参数
   */
  registerByPressingEnter(event: Event) {
    const target = event.target as HTMLInputElement;
    target.blur();
    setTimeout(() => {
      target.focus();
      this.register(this.registerForm.value);
    });
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

  /**
   * 刷新验证码
   */
  refreshCaptcha() {
    if (this.isRefreshingCaptch) {
      return;
    }
    this.isRefreshingCaptch = true;
    this.registerService.refreshCaptcha().then(captcha => {
      this.captchaId = captcha.id;
      this.captchaUrl = `data:image/jpeg;base64,${captcha.image}`;
      this.isRefreshingCaptch = false;
    }, reason => {
      if (reason !== 'left') {
        swal({
          type: 'error',
          title: this.msg.getMessage('E004', '验证码获取'),
          text: this.msg.getMessage('E009')
        }).then(() => {
          this.isRefreshingCaptch = false;
        });
      }
    });
  }
}
