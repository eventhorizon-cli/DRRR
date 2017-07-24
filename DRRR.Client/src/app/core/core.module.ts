import { NgModule, Optional, SkipSelf } from '@angular/core';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { SystemMessagesService } from './system-messages.service';
import { FormErrorsAutoClearerService } from './form-errors-auto-clearer.service';
import { AuthTokenService } from './auth-token.service';

@NgModule({
  declarations: [],
  providers: [
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
