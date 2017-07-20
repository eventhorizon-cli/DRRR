import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTextTrim]'
})
export class TextTrimDirective {

  // 通过NgControl访问FormControl对象
  // 不能用ElementRef ，否则无法把值更新到FormControl
  constructor(private control: NgControl) {}

  @HostListener('change') onChange() {
    this.control.control.setValue(this.control.value.trim());
  }
}
