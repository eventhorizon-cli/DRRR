import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { UserLoginComponent } from './user-login/user-login.component';
import { UserLoginService } from './user-login/user-login.service';
import { UserRegisterService } from './user-register/user-register.service';
import { UserRegisterComponent } from './user-register/user-register.component';
import { UserRoutingModule } from './user-routing.module';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserProfileService } from './user-profile/user-profile.service';

@NgModule({
  declarations: [
    UserLoginComponent,
    UserRegisterComponent,
    UserProfileComponent
],
  imports: [
    SharedModule,
    UserRoutingModule
  ],
  providers: [
    UserLoginService,
    UserRegisterService,
    UserProfileService
  ]
})
export class UserModule { }
