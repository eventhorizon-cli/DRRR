import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { TextTrimDirective } from './text-trim.directive';
import { SiteStateComponent } from './site-state/site-state.component';

@NgModule({
  declarations: [
    TextTrimDirective,
    SiteStateComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextTrimDirective,
    SiteStateComponent
  ]
})
export class SharedModule { }
