import { NgModule, Optional, SkipSelf } from '@angular/core';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { SystemMessagesService } from './system-messages.service';
import { FormErrorsAutoClearerService } from './form-errors-auto-clearer.service';

@NgModule({
  declarations: [],
  providers: [
    SystemMessagesService,
    FormErrorsAutoClearerService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
