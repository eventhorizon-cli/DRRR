import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import { SweetAlertOptions } from 'sweetalert2';

import { AuthService } from './core/services/auth.service';
import { SystemMessagesService } from './core/services/system-messages.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  /**
   * 该用户是否已登录
   */
  isLoggedIn: boolean;

  /**
   * 当前路由
   */
  currentPath: string;

  /**
   * 是否在房间里
   */
  isInTheRoom: boolean;

  constructor(private router: Router,
    private auth: AuthService,
    private msg: SystemMessagesService) {
  }

  ngOnInit() {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .map((event: NavigationEnd) => /(\/\w+)+/.exec(event.urlAfterRedirects)[0])
      .subscribe(path => {
        this.currentPath = path;
        // 如果是在没有选择记住登录状态的情况下回到登录界面界面，则依旧显示登录和注册按钮
        this.isLoggedIn = !['/login', '/register'].includes(path) && this.auth.isLoggedIn;
        this.isInTheRoom = /rooms\/(\w+)/.test(path);
        if (this.isInTheRoom) {
          $('html').css('padding-bottom', 0);
        } else {
          $('html').css('padding-bottom', 50);
        }
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
    let additionalSettings: SweetAlertOptions;
    if (this.isInTheRoom) {
      // 如果在一个房间内
      additionalSettings = {
        input: 'checkbox',
        inputValue: 1,
        inputValidator: result =>
          new Promise<string>((resolve) => {
            if (result) {
              resolve();
            } else {
              this.performSoftDeleteOfConnection()
                .subscribe(() => resolve());
            }
          }),
        onOpen: () => {
          // 替换checkbox样式
          const container = document.querySelector('.swal2-modal.swal2-show');
          const oldCheckbox = <HTMLInputElement>container.querySelector('#swal2-checkbox');
          const label = <HTMLLabelElement>container.querySelector('label.swal2-checkbox');
          const lblMsg = document.createElement('label');
          const div = document.createElement('div');
          const newCheckbox = <HTMLInputElement>oldCheckbox.cloneNode();
          label.style.display = 'none';
          newCheckbox.name = 'rememberRoom';
          div.classList.add('checkbox');
          lblMsg.innerText = this.msg.getMessage('I006');
          lblMsg.setAttribute('for', 'rememberRoom');
          div.appendChild(newCheckbox);
          div.appendChild(lblMsg);
          container.insertBefore(div, label);
          newCheckbox.addEventListener('click', () => {
            oldCheckbox.click();
          });
        }
      };
    }
    this.msg.showConfirmMessage('warning', this.msg.getMessage('I003', '退出'),
      { text: this.msg.getMessage('I004'), ...additionalSettings })
      .then(result => {
        if (!result.dismiss) {
          this.auth.clearTokens();
          this.router.navigateByUrl('/login');
        }
      });
  }

  /**
   * 返回大厅
   */
  backToLobby() {
    if (/rooms\/(\w+)/.test(this.currentPath)) {
      this.msg.showConfirmMessage('warning', this.msg.getMessage('I003', '离开房间'))
        .then(result => {
          if (result.value) {
            this.performSoftDeleteOfConnection()
              .subscribe(() => this.router.navigateByUrl('/rooms'));
          }
          });
    } else {
      this.router.navigateByUrl('/rooms');
    }
  }

  /**
   * 软删除连接信息
   * @returns {Observable<string>} 返回值（空字符串，如果没有返回值，angular会报错）
   */
  private performSoftDeleteOfConnection(): Observable<string> {
    const roomId = /rooms\/(\w+)/.exec(this.currentPath)[1];
    return this.auth.http
      .post(`/api/rooms/connection-soft-delete`,
        { roomId }, { responseType: 'text' });
  }
}
