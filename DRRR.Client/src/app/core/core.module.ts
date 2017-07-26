import { NgModule, Optional, SkipSelf } from '@angular/core';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { SelectivePreloadingStrategy } from './services/selective-preloading-strategy.service';
import { SystemMessagesService } from './services/system-messages.service';
import { FormErrorsAutoClearerService } from './services/form-errors-auto-clearer.service';
import { AuthTokenService } from './services/auth-token.service';

@NgModule({
  declarations: [],
  providers: [
    SelectivePreloadingStrategy,
    SystemMessagesService,
    FormErrorsAutoClearerService,
    AuthTokenService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
