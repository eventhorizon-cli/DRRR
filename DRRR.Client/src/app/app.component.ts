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

  isLoggedIn: boolean;

  currentPath: string;

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
    if (/rooms\/(\w+)/.test(this.currentPath)) {
      // 如果在一个房间内
      additionalSettings = {
        input: 'checkbox',
        inputValue: 1,
        inputValidator: (result) =>
          new Promise<void>((resolve) => {
            if (result) {
              resolve()
            } else {
              this.deleteConnection().subscribe(
                _ => resolve());
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
          newCheckbox.addEventListener('click', function () {
            oldCheckbox.value = this.value;
          })
        }
      }
    }
    this.msg.showConfirmMessage('warning', this.msg.getMessage('I003', '退出'),
      { text: this.msg.getMessage('I004'), ...additionalSettings })
      .then(_ => {
        this.auth.clearTokens();
        this.router.navigateByUrl('/login');
      }, _ => {
      });
  }

  /**
   * 返回大厅
   */
  backToLobby() {
    if (/rooms\/(\w+)/.test(this.currentPath)) {
      this.msg.showConfirmMessage('warning', this.msg.getMessage('I003', '离开房间'))
        .then(() =>
            this.deleteConnection()
              .subscribe(() =>
                this.router.navigateByUrl('/rooms')),
          _ => {
          });
    } else {
      this.router.navigateByUrl('/rooms')
    }
  }

  /**
   * 删除连接信息
   * @returns {Observable<string>} 返回值（空字符串，如果没有返回值，angular会报错）
   */
  private deleteConnection(): Observable<string> {
    const roomId = /rooms\/(\w+)/.exec(this.currentPath)[1];
    const userId = this.auth.getPayloadFromToken('access_token').uid;
    return this.auth.http.delete(`/api/rooms/${roomId}/connections/${userId}`, { responseType: 'text' })
  }
}
