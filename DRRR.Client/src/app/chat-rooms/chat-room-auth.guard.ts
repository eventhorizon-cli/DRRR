import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import swal from 'sweetalert2';

import { AuthService } from '../core/services/auth.service';
import { SystemMessagesService } from '../core/services/system-messages.service';
import { ChatRoomEntryPermissionResponseDto } from './dtos/entry-permission-response.dto';
import { ChatRoomValidatePasswordResponseDto } from './dtos/chat-room-validate-password-response.dto';
import { Roles } from '../core/models/roles.enum';

@Injectable()
export class ChatRoomAuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private msg: SystemMessagesService,
    private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve, reject) => {
      this.auth.http.get<ChatRoomEntryPermissionResponseDto>(
        `/api/rooms/entry-permission?id=${next.params['id']}`)
        .subscribe(res => {
          if (res.allowGuest === false
            && this.auth.getPayloadFromToken('access_token').role === Roles.guest) {
            resolve(false);
            // 该房间不允许游客进入并且当前用户为游客
            this.msg.showConfirmMessage('question',
              this.msg.getMessage('I009'), {
                text: this.msg.getMessage('I011')
              }).then(result => {
                if (result.value) {
                  this.router.navigate(['/register']);
                }
              });
          } else if (res.error) {
            // 会被item组件的catch捕获到，通知list组件刷新数据
            swal(res.error, '', 'error')
              .then(() => reject('refresh'));
            // 进入该房间需要密码且该用户是第一次进入该房间，且用户不是房主或者管理员
          } else if (res.passwordRequired) {
            // 提示用户输入密码
            swal({
              title: this.msg.getMessage('I007'),
              input: 'password',
              showCancelButton: true,
              confirmButtonText: '提交',
              cancelButtonText: '取消',
              showLoaderOnConfirm: true,
              preConfirm: (password) => {
                return new Promise((innerResolve, innerReject) => {
                  this.auth.http
                    .post<ChatRoomValidatePasswordResponseDto>(
                    '/api/rooms/password-validation', {
                      roomId: next.params['id'],
                      password
                    }).subscribe(innerRes => {
                      if (!innerRes.error) {
                        // 没有异常，直接进入
                        innerResolve(true);
                      } else {
                        if (!innerRes.refreshRequired) {
                          swal.showValidationError(innerRes.error);
                          innerResolve(false);
                        } else {
                          // 通知列表组件刷新数据
                          // 显示错误信息
                          swal.close(() => {
                            swal(innerRes.error, '', 'error')
                              .then(() => innerReject('refresh'));
                          });
                        }
                      }
                    });
                });
              },
              allowOutsideClick: false
            }).then(result => resolve(result.value),
                error => reject(error));
          } else {
            // 房间状态正常，不需要密码或者当前用户之前进入过该房间或者当前用户为管理员或者为房主
            resolve(true);
          }
        }, () => resolve(false));
    });
  }
}
