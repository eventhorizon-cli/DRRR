import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import swal from 'sweetalert2';

import { Subscription } from 'rxjs/Subscription';

import { SystemMessagesService } from '../../core/services/system-messages.service';
import { FormErrorsAutoClearer } from '../../core/services/form-errors-auto-clearer.service';
import { UserLoginService } from './user-login.service';
import { AuthService } from '../../core/services/auth.service';
import { UserLoginRequestDto } from '../dtos/user-login-request.dto';

@Component({
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;

  formErrorMessages: object;

  private validationMessages: { [key: string]: Function };

  private formValueChanges: Subscription;

  private controlsValueChanges: Subscription[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private msg: SystemMessagesService,
    private loginService: UserLoginService,
    private autoClearer: FormErrorsAutoClearer,
    private auth: AuthService) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
    this.formErrorMessages = {};
    // 为避免获取消息时配置文件尚未加载，在外面多包一层函数
    this.validationMessages = {
      username: () => this.msg.getMessage('E001', '用户名'),
      password: () => this.msg.getMessage('E001', '密码')
    };
    this.controlsValueChanges = this.autoClearer.register(this.loginForm, this.formErrorMessages);
    // 不管是改了用户名还是密码，都会把用户名或密码错误的报错信息清除
    this.formValueChanges = this.loginForm.valueChanges.subscribe(() => {
      if (this.loginForm.valid) {
        this.formErrorMessages['username'] = '';
      }
    });

    if (this.auth.rememberLoginState) {
      // 判断是否存在登录信息
      const payload = this.auth.getPayloadFromToken('refresh_token');

      if (payload) {
        // 如果存在登录信息，则通过能够刷新令牌来判断登录信息是否已经过期
        this.auth.refreshToken(() => {
          // 登录信息未过期则直接跳转
          this.router.navigate(['/rooms', { page: 1 }]).then(() => {
            this.msg.showAutoCloseMessage('success', 'I002', payload.unique_name);
          });
        });
      } else {
        // 不存在登录信息则将记住登录设为false
        this.auth.rememberLoginState = false;
      }
    }
  }

  ngOnDestroy() {
    this.formValueChanges.unsubscribe();
    this.controlsValueChanges.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * 登录
   * @param {UserLoginRequestDto} loginInfo 登录信息
   */
  login(loginInfo: UserLoginRequestDto) {
    // 显示加载消息框
    this.msg.showLoadingMessage('I005', '登录');

    this.loginService
      .login(loginInfo)
      .subscribe(res => {
        this.msg.closeLoadingMessage();
        if (res.error) {
          // 在用户名输入框下方显示错误信息
          this.formErrorMessages['username'] = res.error;
        } else {
          // 保存登录信息
          this.auth.rememberLoginState = loginInfo.rememberMe;
          this.auth.saveAccessToken(res.accessToken);
          this.auth.saveRefreshToken(res.refreshToken);
          this.router.navigate(['/rooms']).then(() => {
            this.msg.showAutoCloseMessage('success', 'I001', '登录');
          });
        }
      }, () => {
        swal(this.msg.getMessage('E004', '登录'),
          this.msg.getMessage('E010'), 'error')
          .then(() => { }, () => { });
      });
  }

  /**
   * 作为游客登录
   */
  loginAsGuest() {
    this.login({ isGuest: true, rememberMe: false });
  }

  /**
   * 作为注册用户登录
   * @param {UserLoginRequestDto} loginInfo 登录信息
   */
  loginAsRegisteredUser(loginInfo: UserLoginRequestDto) {
    if (!this.loginForm.valid) {
      for (const controlName in this.loginForm.controls) {
        if (!this.loginForm.controls[controlName].valid) {
          this.formErrorMessages[controlName] = this.validationMessages[controlName]();
        }
      }
    } else if (!this.formErrorMessages['username']) {
      this.login({...loginInfo, isGuest: false});
    }
  }
}
