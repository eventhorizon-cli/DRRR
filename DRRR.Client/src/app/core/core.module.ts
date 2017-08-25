import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { SelectivePreloadingStrategy } from './services/selective-preloading-strategy.service';
import { SystemMessagesService } from './services/system-messages.service';
import { FormErrorsAutoClearer } from './services/form-errors-auto-clearer.service';
import { AuthService } from './services/auth.service';

@NgModule({
  imports: [
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(
      {
        closeButton: true,
        progressBar: true
      })],
  providers: [
    SelectivePreloadingStrategy,
    SystemMessagesService,
    FormErrorsAutoClearer,
    AuthService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
