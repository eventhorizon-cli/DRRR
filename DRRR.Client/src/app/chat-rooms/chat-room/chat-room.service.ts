import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs/Subject';

// 可能会导致编译问题
// 参考资料：https://github.com/aspnet/SignalR/issues/983
import { HubConnection } from '@aspnet/signalr-client/dist/browser/signalr-clientES5-1.0.0-alpha2-final.js';
// import { HubConnection } from '@aspnet/signalr-client';

import swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';
import { SystemMessagesService } from '../../core/services/system-messages.service';
import { Message } from '../models/message.model';
import { Payload } from '../../core/models/payload.model';
import { ChatRoomInitialDisplayDto } from '../dtos/chat-room-initial-display.dto';
import { ChatHistoryDto } from '../dtos/chat-history.dto';
import { ChatRoomMemberDto } from '../dtos/chat-room-member.dto';

@Injectable()
export class ChatRoomService {

  message: Subject<Message>;

  chatHistory: Subject<Message>;

  initialDto: Subject<ChatRoomInitialDisplayDto>;

  memberList: Subject<ChatRoomMemberDto[]>;

  /**
   * 当重连的时候触发的回调函数
   */
  onReconnect: Function;

  private connection: HubConnection;

  private roomId: string;

  private userInfo: Payload;

  // 表示是否处于主动切断状态
  private disconnected: boolean;

  // 进入该房间时的时间（时间戳）
  private entryTime: number;

  // 前一次显示的历史聊天记录时间的时间戳
  private lastHistoryTimeStamp: number;

  // 此次获取的聊天历史记录的开始序号
  private startIndex: number;

  constructor(
    private auth: AuthService,
    private msg: SystemMessagesService,
    private router: Router
  ) {
    this.message = new Subject<Message>();
    this.chatHistory = new Subject<Message>();
    this.initialDto = new Subject<ChatRoomInitialDisplayDto>();
    this.memberList = new Subject<ChatRoomMemberDto[]>();
  }

  /**
   * 连接房间
   * @param {string} roomId 房间ID
   */
  connect(roomId: string) {
    this.auth.refreshTokenWhenNecessary(() => {
      this.roomId = roomId;

      this.connection = new HubConnection(`/chat?authorization=${this.auth.accessToken}`);

      this.disconnected = false;

      // 打开连接
      this.connection.start().then(() => {

        // 每次连接后都重新获取，避免更换身份登陆后出现问题
        this.userInfo = this.auth.getPayloadFromToken('access_token');

        this.connection.invoke('JoinRoomAsync', roomId)
          .then((res: ChatRoomInitialDisplayDto) => {
            this.initialDto.next(res);
            this.entryTime = res.entryTime;
            // 初期显示或者是重新连接
            // 失去连接期间未收到的消息作为历史信息被显示
            this.lastHistoryTimeStamp = 0;
            this.startIndex = 0;
            this.onReconnect();
          });
      });

      // 创建回调函数
      // 聊天消息
      this.connection.on('broadcastMessage',
        (userId: string, username: string, message: string) => {
          this.message.next({
            userId,
            username,
            isSystemMessage: false,
            incoming: (this.userInfo.uid !== userId),
            text: message
          });
        });

      // 系统消息
      this.connection.on('broadcastSystemMessage',
        (message: string) => {
          this.message.next({
            isSystemMessage: true,
            text: message
          });
        });

      this.connection.on('refreshMemberList',
        (list) => {
          this.memberList.next(list);
        });

      // 连接被异常切断
      this.connection.onclose(this.onClose.bind(this));

      // 当房间被关闭时
      this.connection.on('onRoomDeleted', (msg) => {
        swal(msg, '', 'error')
          .then(() => {
            // 返回大厅
            this.router.navigateByUrl('/rooms');
          }, () => {
            // 返回大厅
            this.router.navigateByUrl('/rooms');
          });
      });
    });
  }

  /**
   * 发送消息
   * @param {HTMLInputElement} message 消息输入框控件
   */
  sendMessage(message: HTMLInputElement) {
    // 如果连接被关闭，会被设为null
    if (this.connection) {
      this.connection.send('SendMessage', this.roomId, message.value)
        .then(() => {
          // 消息发送成功，清空输入框
          message.value = '';
        }).catch(() => {
          this.reconnect(this.msg.getMessage('E004', '消息发送'));
        });
    } else {
      this.reconnect(this.msg.getMessage('E004', '消息发送'));
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
      this.connection.send('LeaveRoomAsync', this.roomId)
        .then(() => {
          this.connection.stop();
        });
    }
  }

  /**
   * 获取历史聊天记录
   * @return {Promise<number>} Promise对象,返回此次获取到的消息数
   */
  getChatHistory(): Promise<number> {
    return new Promise<number>(((resolve, reject) => {
      this.connection.invoke('GetChatHistoryAsync', this.roomId, this.entryTime, this.startIndex)
        .then((history: ChatHistoryDto[]) => {
          this.startIndex += history.length;

          history.forEach(msg => {
            let timestamp: number;
            if (!this.lastHistoryTimeStamp
              || (this.lastHistoryTimeStamp - msg.timestamp) > 60000) {
              // 超过一分钟以上显示时间
              this.lastHistoryTimeStamp = msg.timestamp;
              timestamp = msg.timestamp;
            }

            const message: Message = {
              userId: msg.userId,
              username: msg.username,
              isSystemMessage: false,
              incoming: (msg.userId !== this.userInfo.uid),
              text: msg.message,
              timestamp,
              isChatHistory: true
            };

            this.chatHistory.next(message);
          });
          resolve(history.length);
        });
    }));
  }

  /**
   * 被异常关闭时
   */
  private onClose() {
    this.connection = null;
    if (this.disconnected) {
      // 如果是主动切断则不做任何处理
      return;
    }
    this.reconnect(this.msg.getMessage('E008'));
  }

  /**
   * 显示提示信息并尝试重连
   * @param {string} msg 提示信息
   */
  private reconnect(msg: string) {
    swal(msg,
      this.msg.getMessage('E009'), 'error')
      .then(() => {
        // 尝试重新连接
        try {
          this.connect(this.roomId);
          // 重置消息显示
          this.message.unsubscribe();
          this.chatHistory.unsubscribe();
          this.message = new Subject<Message>();
          this.chatHistory = new Subject<Message>();
        } catch (e) {
          this.reconnect(this.msg.getMessage('E008'));
        }
      }, () => { });
  }
}
