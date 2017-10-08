import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { HubConnection } from '@aspnet/signalr-client';

import swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';
import { SystemMessagesService } from '../../core/services/system-messages.service';
import { Message } from '../models/message.model';
import { Payload } from '../../core/models/payload.model';

@Injectable()
export class ChatRoomService {

  message: Subject<Message>;

  private connection: HubConnection;

  private roomId: string;

  private userInfo: Payload;

  // 表示是否处于主动切断状态
  private disconnected: boolean;

  constructor(
    private auth: AuthService,
    private msg: SystemMessagesService,
    private router: Router
  ) {
    this.message = new Subject<Message>();
    this.userInfo = auth.getPayloadFromToken('access_token');
  }

  /**
   * 连接房间
   * @param {string} roomId 房间ID
   */
  connect(roomId: string) {
    // 尝试刷新Token避免过期
    this.auth.refreshToken(() => {
      this.roomId = roomId;

      this.connection = new HubConnection(`/chat?authorization=${this.auth.accessToken}`);

      this.disconnected = false

      // 创建回调函数
      // 聊天消息
      this.connection.on('broadcastMessage', (userId, username, message) => {
        this.message.next({
          userId,
          username,
          isSystemMessage: false,
          incoming: (this.userInfo.uid !== userId),
          text: message
        });
      });

      // 系统消息
      this.connection.on('broadcastSystemMessage', (message) => {
        this.message.next({
          isSystemMessage: true,
          text: message
        });
      });

      // 打开连接
      this.connection.start().then(() => {
        this.connection.invoke('JoinRoomAsync', roomId);
      });

      // 连接被异常切断
      this.connection.onClosed = this.onClose.bind(this);

      // 当房间被关闭时
      this.connection.on('onRoomDeleted', (msg) => {
        swal(msg, '', 'error')
          .then(() => {
            // 返回大厅
            this.router.navigateByUrl('/rooms');
          }, () => {});
      })
    });
  }

  /**
   * 发送消息
   * @param {HTMLInputElement} message 消息输入框控件
   */
  sendMessage(message: HTMLInputElement) {
    // 如果连接被关闭，会被设为null
    if (this.connection) {
      this.connection.invoke('SendMessage', this.roomId, message.value);
      // 消息发送成功，清空输入框
      message.value = '';
    } else {
      swal(this.msg.getMessage('E004', '消息发送'),
        this.msg.getMessage('E009'), 'error')
        .then(() => {
          // 尝试重新连接
          this.connect(this.roomId);
        }, () => {});
    }
  }

  /**
   * 切断连接
   */
  disconnect() {
    if (this.connection) {
      this.disconnected = true;
      // 打开连接
      // 通知服务器该用户离开房间了
      this.connection.invoke('LeaveRoomAsync', this.roomId)
        .then(() => {
          this.connection.stop();
        });
    }
  }

  /**
   * 被异常关闭时
   * @param {Error} e 异常
   */
  onClose(e?: Error) {
    this.connection = null;
    if (this.disconnected) {
      // 如果是主动切断则不做任何处理
      return;
    }
    swal(this.msg.getMessage('E008'),
      this.msg.getMessage('E009'), 'error')
      .then(() => {
        // 尝试重新连接
        this.connect(this.roomId);
      }, () => {});
  }

  /**
   * 获取房间名
   * @param {string} roomId 房间ID
   * @returns {Observable<string>} 房间名
   */
  getRoomName(roomId: string): Observable<string> {
    return this.auth.http.get(`api/rooms/${roomId}/name`, { responseType: 'text' });
  }
}
