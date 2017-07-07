import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UserLoginComponent } from './user-login/user-login.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { userRoutes } from './user.routes';

@NgModule({
  declarations: [
    UserLoginComponent,
    UserRegisterComponent
  ],
  imports: [
    // 根模块导入user模块后就可以直接使用user模块内定义好的路由
    RouterModule.forRoot(userRoutes)
  ],
  exports: [
    UserLoginComponent,
    UserRegisterComponent
  ]
})
export class UserModule { }
