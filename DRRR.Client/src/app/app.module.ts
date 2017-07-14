import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { CoreModule } from './core/core.module';
import { UserModule } from './user/user.module';

import { appRoutes } from './app.routes';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // 在其它任何模块中都不要导入BrowserModule。
    // 特性模块和惰性加载模块应该改成导入CommonModule。
    // 它们不需要重新初始化全应用级的提供商。
    BrowserModule,
    HttpModule,
    CoreModule,
    UserModule,
    // 永远不要在特性路由模块中调用RouterModule.forRoot！
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
