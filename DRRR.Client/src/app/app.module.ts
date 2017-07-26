import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { CoreModule } from './core/core.module';
import { UserModule } from './user/user.module';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

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
    AppRoutingModule,
    CoreModule,
    UserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
