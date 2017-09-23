import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { SelectivePreloadingStrategy } from './services/selective-preloading-strategy.service';
import { SystemMessagesService } from './services/system-messages.service';
import { FormErrorsAutoClearer } from './services/form-errors-auto-clearer.service';
import { AuthService } from './services/auth.service';

@NgModule({
  imports: [
    HttpClientModule],
  providers: [
    SelectivePreloadingStrategy,
    SystemMessagesService,
    FormErrorsAutoClearer,
    AuthService,
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
