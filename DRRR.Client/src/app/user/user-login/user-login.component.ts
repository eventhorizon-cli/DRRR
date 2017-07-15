import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SystemMessagesService } from '../../core/system-messages.service'
import { UserLoginService } from './user-login.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  loginForm: FormGroup;

  formErrorMessages: object;

  private validationMessages: object;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private msgService: SystemMessagesService,
    private loginService: UserLoginService
  ) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.formErrorMessages = {};
    // 为避免获取消息时配置文件尚未加载，在外面多包一层函数
    this.validationMessages = {
      userName: () => this.msgService.getMessage('E001', '用户名'),
      password: () => this.msgService.getMessage('E001', '密码')
    };
    this.loginForm.valueChanges.subscribe(this.valueChanges.bind(this));
  }

  onLogin(data: object) {
    if (!this.loginForm.valid) {
      for (const controlName in this.loginForm.controls) {
        if (!this.loginForm.controls[controlName].valid) {
          this.formErrorMessages[controlName] = this.validationMessages[controlName]();
        }
      }
    } else {
      this.loginService
        .login(data)
        .subscribe(res => {
          if (res.error) {
            this.formErrorMessages['userName'] = res.error;
          }else {
          }
      });
    }
  }

  private valueChanges(data: object) {
    for (const key in data) {
      if (this.formErrorMessages[key] && data[key]) {
        // 如果之前报错的框被填入有效数据，则将对应输入框报错信息去除
        // 如果是用户名及密码失败的错误，修改用户名或密码均会将报错信息去除
        this.formErrorMessages[key] = '';
      }
    }
  }
}
