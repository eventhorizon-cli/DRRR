import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SelectivePreloadingStrategy } from './core/services/selective-preloading-strategy.service';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'rooms',
    loadChildren: 'app/chat-rooms/chat-rooms.module#ChatRoomsModule',
    data: { preload: true }
  }
];

@NgModule({
  imports: [
    // 永远不要在特性路由模块中调用RouterModule.forRoot！
    RouterModule.forRoot(appRoutes,
      // 只预加载那些data.preload标志为true的路由
      { preloadingStrategy: SelectivePreloadingStrategy })
  ],
  // 把RouterModule添加到路由模块的exports中，
  // 以便关联模块（比如AppModule）中的组件可以访问路由模块中的声明，
  // 比如RouterLink 和 RouterOutlet。
  exports: [RouterModule]
})
export class AppRoutingModule { }
