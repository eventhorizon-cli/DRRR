import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs/Subject';

// 可能会导致编译问题或者ie下兼容问题
// 参考资料：https://github.com/aspnet/SignalR/issues/983
// import { HubConnection } from '@aspnet/signalr-client/dist/browser/signalr-clientES5-1.0.0-alpha2-final.js';
import { HubConnection } from '@aspnet/signalr-client';

import swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';
import { SystemMessagesService } from '../../core/services/system-messages.service';
import { Message } from '../models/message.model';
import { Payload } from '../../core/models/payload.model';
import { ChatRoomInitialDisplayDto } from '../dtos/chat-room-initial-display.dto';
import { ChatRoomMemberDto } from '../dtos/chat-room-member.dto';

@Injectable()
export class ChatRoomService {

  message: Subject<Message>;

  chatHistory: Subject<Message[]>;

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

  // 此次获取的聊天历史记录的开始序号
  private startIndex: number;

  constructor(
    private auth: AuthService,
    private msg: SystemMessagesService,
    private router: Router
  ) {
    this.message = new Subject<Message>();
    this.chatHistory = new Subject<Message[]>();
    this.initialDto = new Subject<ChatRoomInitialDisplayDto>();
    this.memberList = new Subject<ChatRoomMemberDto[]>();
  }

  /**
   * 连接房间
   * @param {string} roomId 房间ID
   */
  connect(roomId: string) {
    this.auth.refreshTokenIfNeeded().then(() => {
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
            this.startIndex = 0;
            this.onReconnect();
          });
      });

      // 创建回调函数
      // 聊天消息
      this.connection.on('broadcastMessage',
        (userId: string, username: string, message: string, isPicture: boolean) => {
          this.message.next({
            userId,
            username,
            isSystemMessage: false,
            incoming: (this.userInfo.uid !== userId),
            data: message,
            isPicture
          });
        });

      // 系统消息
      this.connection.on('broadcastSystemMessage',
        (message: string) => {
          this.message.next({
            username: '系统消息',
            isSystemMessage: true,
            data: message
          });
        });

      // 刷新成员列表
      this.connection.on('refreshMemberList', list => this.memberList.next(list));

      // 当前用户被房主移出房间
      this.connection.on('onRemoved', this.backToLobby.bind(this));

      // 连接被异常切断
      this.connection.onclose(this.onClose.bind(this));

      // 当房间被关闭时
      this.connection.on('onRoomDeleted', this.backToLobby.bind(this));

      // 重复登录同一个聊天室时
      this.connection.on('onDuplicateLogin', () => {
        this.auth.clearTokens();
        swal(this.msg.getMessage('I013'), '', 'warning')
          .then(() => this.router.navigateByUrl('/login'));
      });
    }, () => { });
  }

  /**
   * 发送消息
   * @param {HTMLInputElement} message 消息输入框控件
   */
  sendMessage(message: HTMLInputElement) {
    // 如果连接被关闭，会被设为null
    if (this.connection) {
      try {
        this.connection.send('SendMessageAsync', this.roomId, message.value)
          .then(() => {
            // 消息发送成功，清空输入框
            message.value = '';
          });
      } catch (e) {
        this.reconnect(this.msg.getMessage('E004', '消息发送'));
      }
    } else {
      this.reconnect(this.msg.getMessage('E004', '消息发送'));
    }
  }

  /**
   * 发送图片
   * @param {string} base64String 图片数据对应的base64String字符串
   * @returns {Promise<void>} Promise对象
   */
  sendPicture(base64String: string): Promise<void> {
    return this.connection.send('SendPictureAsync', this.roomId, base64String);
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
  async getChatHistory(): Promise<number> {
    const history = await this.connection
      .invoke('GetChatHistoryAsync', this.roomId, this.entryTime, this.startIndex);
    // 设置下次获取历史记录用的索引
    this.startIndex += history.length;

    // 前一次显示的历史聊天记录时间的时间戳
    let lastTimeStamp: number;

    // 收到的是按时间倒序排的历史消息
    const messages: Message[] = history.reverse().map(msg => {
      let timestamp: number;
      if (!lastTimeStamp
        || (msg.timestamp - lastTimeStamp) > 60000) {
        // 超过一分钟以上显示时间
        lastTimeStamp = msg.timestamp;
        timestamp = msg.timestamp;
      }
      return {
        userId: msg.userId,
        username: msg.username,
        isSystemMessage: false,
        incoming: (msg.userId !== this.userInfo.uid),
        data: msg.data,
        timestamp,
        isPicture: msg.isPicture,
        isChatHistory: true
      };
    });
    this.chatHistory.next(messages);
    return history.length;
  }

  /**
   * 删除房间成员
   * @param {string} uid 用户ID
   */
  removeMember(uid: string) {
    this.connection.send('RemoveMemberAsync', this.roomId, uid);
  }

  /**
   * 显示提示消息并返回大厅
   * @param {string} msg 消息
   */
  private backToLobby(msg: string) {
    swal(msg, '', 'error')
      .then(() => {
        // 返回大厅
        this.router.navigateByUrl('/rooms');
      });
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
        this.connect(this.roomId);
        // 重置消息显示
        this.message.unsubscribe();
        this.chatHistory.unsubscribe();
        this.message = new Subject<Message>();
        this.chatHistory = new Subject<Message[]>();
      });
  }
}
