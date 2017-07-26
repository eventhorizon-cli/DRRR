import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    // 永远不要在特性路由模块中调用RouterModule.forRoot！
    RouterModule.forRoot(appRoutes)
  ],
  // 把RouterModule添加到路由模块的exports中，
  // 以便关联模块（比如AppModule）中的组件可以访问路由模块中的声明，
  // 比如RouterLink 和 RouterOutlet。
  exports: [RouterModule]
})
export class AppRoutingModule { }
