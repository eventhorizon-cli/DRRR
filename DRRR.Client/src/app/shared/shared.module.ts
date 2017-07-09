import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { TextTrimDirective } from './text-trim.directive';

@NgModule({
  declarations: [
    TextTrimDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextTrimDirective
  ]
})
export class SharedModule { }
