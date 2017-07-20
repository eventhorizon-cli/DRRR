import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { UserLoginComponent } from './user-login/user-login.component';
import { UserLoginService } from './user-login/user-login.service';
import { UserRegisterService } from './user-register/user-register.service';
import { UserRegisterComponent } from './user-register/user-register.component';
import { userRoutes } from './user.routes';

@NgModule({
  declarations: [
    UserLoginComponent,
    UserRegisterComponent
  ],
  imports: [
    // 总是在特性路由模块中调用RouterModule.forChild
    RouterModule.forChild(userRoutes),
    SharedModule
  ],
  providers: [
    UserLoginService,
    UserRegisterService
  ]
})
export class UserModule { }
