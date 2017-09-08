import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import swal from 'sweetalert2';

import { AuthService } from './core/services/auth.service';
import { SystemMessagesService } from './core/services/system-messages.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isLoggedIn: boolean;

  currentPath: string;

  constructor (
    private router: Router,
    private auth: AuthService,
    private msg: SystemMessagesService) {
  }

  ngOnInit() {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .map((event: NavigationEnd) => /[a-z]+/.exec(event.urlAfterRedirects)[0])
      .subscribe(path => {
        this.currentPath = path;
        // 如果是在没有选择记住登录状态的情况下回到登录界面界面，则依旧显示登录和注册按钮
        this.isLoggedIn = !['login', 'register'].includes(path) && this.auth.isLoggedIn;
      });
  }

  /**
   * 选中菜单选项以滑动方式隐藏菜单
   * @param {string} expanded 表示菜单是否属于展开状态
   * @param {HTMLInputElement} el 触发菜单展开和关闭的按钮
   */
  slideUp(expanded: string, el: HTMLInputElement) {
    if (expanded === 'true') {
      el.click();
    }
  }

  /**
   * 注销登录
   */
  logout() {
    swal({
      title: this.msg.getMessage('I003', '退出'),
      text: this.msg.getMessage('I004'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: '是',
      cancelButtonText: '取消'
    })
      .then(_ => {
        this.auth.clearTokens();
        this.router.navigateByUrl('/login');
      }, _ => { });
  }
}
