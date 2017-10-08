import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

@Injectable()
/**
 * 自动消除表单错误
 */
export class FormErrorsAutoClearer {

  /**
   * 向清理器注册
   * @param {FormGroup} formGroup 表单
   * @param {Object} formErrorMessages 错误信息容器
   * @return 表单控件的Subscription数组
   */
  register(formGroup: FormGroup, formErrorMessages: object): Subscription[] {
    // 循环内部用const或者let的地方，编译成es5时会在方法内部创建匿名函数，
    // 以创建变量的副本，避免无块级作用域问题
    const subscriptions = new Array<Subscription>();
    for (const [controlName, control] of Object.entries(formGroup.controls)) {
      subscriptions.push(control.valueChanges.subscribe(value => {
        // 如果之前报错的输入框的值被修改，则将对应输入框报错信息去除
        formErrorMessages[controlName] = '';
      }));
    }
    return subscriptions;
  }
}
