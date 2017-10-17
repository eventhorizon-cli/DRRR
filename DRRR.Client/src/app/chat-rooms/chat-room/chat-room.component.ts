import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/scan';

import { ChatRoomService } from './chat-room.service';
import { Message } from '../models/message.model';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {

  messages: Observable<Message[]>;

  chatHistory: Observable<Message[]>;

  roomName: Subject<string>;

  noMoreMessage: boolean;

  private msgSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private chatRoomService: ChatRoomService
  ) { }

  ngOnInit() {
    // 聊天界面窗口高度
    // 一开始的高度
    this.setHeight();
    // 重新设置窗口大小后
    window.addEventListener('resize', () => {
      this.setHeight();
      this.scrollToBottom();
    });

    this.messages = this.chatRoomService.message
      .scan((messages: Message[], message: Message) =>
        messages.concat(message), []);

    // 聊天历史记录
    this.chatHistory = this.chatRoomService.chatHistory
      .scan((messages: Message[], message: Message) =>
        [message].concat(messages), []);

    this.msgSubscription = this.messages.subscribe(_ => {
      // 消息窗口滚至下方
      setTimeout(() => {
        this.scrollToBottom();
      });
    });

    this.chatRoomService.onReconnect = () => {
      this.chatRoomService.getChatHistory()
        .then(count => {
          this.noMoreMessage = count < 50;
          setTimeout(() => {
            this.scrollToBottom();
          });
        });
    };

    const roomId = this.route.snapshot.params['id'];
    this.chatRoomService.connect(roomId);
    this.roomName = this.chatRoomService.roomName;
  }

  ngOnDestroy() {
    // 取消订阅以避免异常，避免离开后在scrollToBottom方法中找不到元素而导致异常
    this.msgSubscription.unsubscribe();
    // 离开房间时关闭连接
    this.chatRoomService.disconnect();
  }

  /**
   * 发送消息
   * @param {HTMLInputElement} message 消息框输入控件
   * @returns {boolean} 返回false避免事件冒泡
   */
  sendMessage(message: HTMLInputElement): boolean | undefined{
    if (message.value && message.value.length <= 200) {
      this.chatRoomService.sendMessage(message);
      // 防止事件冒泡关闭提示框
      // zone.js中会调用event.preventDefault
      return false;
    }
  }

  /**
   * 显示更多历史消息
   */
  showMoreChatHistory() {
    this.chatRoomService.getChatHistory()
      .then(count => {
        this.noMoreMessage = count < 50;
      });
  }

  /**
   * 将消息框内容滚动至最下方
   */
  private scrollToBottom() {
    const scrollPane = $('.msg-container-base');
    // 避免某些情况下离开房间时导致的异常
    if (scrollPane.length) {
      scrollPane.animate({scrollTop: scrollPane[0].scrollHeight});
    }
  }

  /**
   * 设置消息容器高度
   */
  private setHeight() {
    const panelHeading = $('.panel-heading');
    const panelFooter = $('.panel-footer');

    // 避免某些情况下离开房间时导致的异常
    if (panelHeading.length && panelFooter.length) {
      const height = window.innerHeight
        - (+panelHeading[0].offsetTop)
        - (+panelHeading[0].clientHeight)
        - (+panelFooter[0].clientHeight) - 50;

      $('.msg-container-base').height(height);
    }
  }
}
