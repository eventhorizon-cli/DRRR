import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import { SystemMessagesService } from '../../core/system-messages.service';
import { UserRegisterService } from './user-register.service';
import {FormErrorsAutoClearerService} from '../../core/form-errors-auto-clearer.service';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent {

  registerForm: FormGroup;

  formErrorMessages: object;

  requiredValidationMessages: object;

  constructor(private fb: FormBuilder,
              private router: Router,
              private msgService: SystemMessagesService,
              private registerService: UserRegisterService,
              private autoClearer: FormErrorsAutoClearerService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(14)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
      confirmPassword: ['', Validators.required]
    });

    this.formErrorMessages = {};

    this.requiredValidationMessages = {
      username: () => this.msgService.getMessage('E001', '用户名'),
      password: () => this.msgService.getMessage ('E001', '密码'),
      confirmPassword: () => this.msgService.getMessage('E001', '确认密码')
    };
    autoClearer.register(this.registerForm, this.formErrorMessages);
  }

  /**
   * 验证用户名是否合法
   * @param {FormControl} username 用户名
   */
  validateUsername(username: FormControl) {
    // 以防先走这个方法，所以加上trim
    if (username.value.trim()) {
      this.registerService
        .validateUsername(username.value)
        .subscribe(res => {
          if (this.formErrorMessages['username'] = res['error']) {
            username.setErrors({illegal: true});
          }
        });
    }
  }

  /**
   * 验证密码输入是否合法
   * @param {FormControl} password 密码
   */
  validatePassword(password: FormControl) {
    this.formErrorMessages['password'] = password.valid ? '' :
      this.msgService.getMessage('E002', '6', '128', '密码');
  }

  /**
   * 点击注册
   * @param {Object} data
   */
  onRegister(data: object) {
    for (const controlName of Object.keys(this.registerForm.controls)) {
      this.validateRequired(controlName);
    }
    // 密码被输入时才验证确认密码
    if (data['password'] && data['password'] !== data['confirmPassword']) {
      this.formErrorMessages['confirmPassword'] = this.msgService.getMessage('E003', '密码');
      return;
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
