import { Directive, HostBinding, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTextTrim]'
})
export class TextTrimDirective {

  constructor(private el: ElementRef) {}

  @HostListener('change') onChange() {
    const elem = this.el.nativeElement as HTMLInputElement;
    elem.value = elem.value.trim();
  }
}
