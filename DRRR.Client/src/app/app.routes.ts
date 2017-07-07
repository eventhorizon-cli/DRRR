import { Routes } from '@angular/router';

import { UserLoginComponent } from './user/user-login/user-login.component';
import { UserRegisterComponent } from './user/user-register/user-register.component';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: UserLoginComponent
  },
  {
    path: 'register',
    component: UserRegisterComponent
  }
];
