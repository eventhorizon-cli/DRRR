import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * 自动对输入框的值进行Trim
 */
@Directive({
  selector: '[appTextTrim]'
})
export class TextTrimDirective {

  // 通过NgControl访问FormControl对象
  // 不能用ElementRef ，否则无法把值更新到FormControl
  constructor(private control: NgControl) {}

  @HostListener('change') onChange() {
    // 注意，如果对应的输入框被绑定了其他失去焦点时的事件，这个不一定是最早执行的
    this.control.control.setValue((this.control.value + '').trim());
  }
}
