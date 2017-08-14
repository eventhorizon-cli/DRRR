import { Injectable } from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';

@Injectable()
/**
 * 自动消除表单错误
 */
export class FormErrorsAutoClearerService {

  /**
   * 向清理器注册
   * @param {FormGroup} formGroup 表单
   * @param {Object} formErrorMessages 错误信息容器
   */
  register(formGroup: FormGroup, formErrorMessages: object) {
    let control: AbstractControl;
    // 循环内部用const或者let的地方，编译成es5时会在方法内部创建匿名函数，
    // 以创建变量的副本，避免无块级作用域问题
    for (const controlName of Object.keys(formGroup.controls)) {
      control = formGroup.controls[controlName];
      control.valueChanges.subscribe(value => {
        // 如果之前报错的输入框的值被修改，则将对应输入框报错信息去除
        formErrorMessages[controlName] = '';
      });
    }
  }
}
