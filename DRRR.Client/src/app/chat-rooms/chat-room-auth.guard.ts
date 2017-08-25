import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import swal from 'sweetalert2';

import { AuthService } from '../core/services/auth.service';
import { SystemMessagesService } from '../core/services/system-messages.service';

@Injectable()
export class ChatRoomAuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private msg: SystemMessagesService,
    private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): boolean {
    const payload = this.auth.getPayloadFromToken('refresh_token', true);

    if (!payload) {
      // 如果登录信息不存在则反回登录界面
      swal(this.msg.getMessage('E004', '账号信息获取'),
        this.msg.getMessage('E007', '登录'), 'error')
        .then(() => {
          // 返回登录界面
          this.router.navigateByUrl('/login');
        });
      return false;
    }
    return true;
  }
}
