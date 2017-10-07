import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import swal from 'sweetalert2';

import { AuthService } from '../core/services/auth.service';
import { SystemMessagesService } from '../core/services/system-messages.service';
import { ChatRoomApplyForEntryResponseDto } from './dtos/chat-room-apply-for-entry-response.dto';
import { ChatRoomValidatePasswordResponseDto } from './dtos/chat-room-validate-password-response.dto';

@Injectable()
export class ChatRoomAuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private msg: SystemMessagesService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve, reject) => {
      this.auth.http.get<ChatRoomApplyForEntryResponseDto>(
        `/api/rooms/application-for-entry?id=${next.params['id']}`)
        .subscribe(res => {
          if (res.error) {
            // 被item组件的catch捕获到，通知list组件刷新数据
            reject('refresh');
            // 显示错误信息
            this.msg.showAutoCloseMessage('error', 'I000', res.error);
            // 进入该房间需要密码且该用户是第一次进入该房间，且用户不是房主或者管理员
          } else if (res.passwordRequired) {
            // 提示用户输入密码
            swal({
              title: this.msg.getMessage('I007'),
              input: 'password',
              showCancelButton: true,
              confirmButtonText: '提交密码',
              cancelButtonText: '取消',
              showLoaderOnConfirm: true,
              preConfirm: (password) => {
                return new Promise((innerResolve, innerReject) => {
                  this.auth.http
                    .post<ChatRoomValidatePasswordResponseDto>('/api/rooms/password-validation', {
                    roomId: next.params['id'],
                    password
                  })
                    .subscribe(innerRes => {
                      if (!innerRes.error) {
                        // 没有异常，直接进入
                        innerResolve(true);
                      } else {
                        if (!innerRes.refresh) {
                          innerReject(innerRes.error);
                        } else {
                          // 通知列表组件刷新数据
                          // 显示错误信息
                          this.msg.showAutoCloseMessage('error', 'I000', innerRes.error);
                          reject('refresh');
                        }
                      }
                    })
                })
              },
              allowOutsideClick: false
            }).then(() => resolve(true), () => resolve(false));
          } else {
            // 房间状态正常，不需要密码或者当前用户之前进入过该房间或者当前用户为管理员或者为房主
            resolve(true);
          }
        });
    });
  }
}
