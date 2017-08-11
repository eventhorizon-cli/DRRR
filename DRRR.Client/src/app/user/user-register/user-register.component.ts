import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import { SystemMessagesService } from '../../core/services/system-messages.service';
import { UserRegisterService } from './user-register.service';
import { FormErrorsAutoClearerService } from '../../core/services/form-errors-auto-clearer.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {

  registerForm: FormGroup;

  formErrorMessages: object;

  requiredValidationMessages: object;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private msgService: SystemMessagesService,
    private registerService: UserRegisterService,
    private autoClearer: FormErrorsAutoClearerService,
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
      username: () => this.msgService.getMessage('E001', '用户名'),
      password: () => this.msgService.getMessage ('E001', '密码'),
      confirmPassword: () => this.msgService.getMessage('E001', '确认密码')
    };
    this.autoClearer.register(this.registerForm, this.formErrorMessages);
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
        this.formErrorMessages['username'] = this.msgService.getMessage('E002', '2', '10', '用户名');
        return;
      }
      this.registerService
        .validateUsername(username.value)
        .subscribe(res => {
          if (this.formErrorMessages['username'] = res['error']) {
            username.setErrors({illegal: !!res['error']});
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
        this.msgService.getMessage('E002', '6', '128', '密码');
    }
  }

  /**
   * 点击注册
   * @param {Object} data
   */
  onRegister(registerInfo: object) {
    for (const controlName of Object.keys(this.registerForm.controls)) {
      this.validateRequired(controlName);
    }
    // 确认密码被输入时才验证确认密码
    if (registerInfo['confirmPassword'] && registerInfo['password'] !== registerInfo['confirmPassword']) {
      this.formErrorMessages['confirmPassword'] = this.msgService.getMessage('E003', '密码');
      return;
    }
    if (this.registerForm.valid) {
      this.registerService.register(registerInfo)
        .subscribe(res => {
          if (!res.error) {
            this.auth.saveToken(res.token);
          }
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
