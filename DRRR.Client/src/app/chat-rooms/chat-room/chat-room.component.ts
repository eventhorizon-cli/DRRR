import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
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

  height: string;

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

    window.addEventListener('scroll', () => {
    });

    this.messages = this.chatRoomService.message
      .scan((messages: Message[], message: Message) =>
        messages.concat(message), []);

    this.msgSubscription = this.messages.subscribe(_ => {
      // 消息窗口滚至下方
      setTimeout(() => {
        this.scrollToBottom();
      });
    });

    const roomId = this.route.snapshot.params['id'];
    this.chatRoomService.connect(roomId);
  }

  ngOnDestroy() {
    // 取消订阅以避免异常，避免离开后在scrollToBottom方法中找不到元素而导致异常
    this.msgSubscription.unsubscribe();
    // 离开房间时关闭连接
    this.chatRoomService.disconnect();
  }

  sendMessage(message: HTMLInputElement): boolean | undefined{
    if (message.value && message.value.length <= 200) {
      this.chatRoomService.sendMessage(message);
      // 防止事件冒泡关闭提示框
      // zone.js中会调用event.preventDefault
      return false;
    }
  }

  // 将消息框内容滚动至最下方
  scrollToBottom() {
    const scrollPane = document.querySelector('.msg-container-base');
    // 避免某些情况下离开房间时导致的异常
    if (scrollPane) {
      scrollPane.scrollTop = scrollPane.scrollHeight;
    }
  }

  setHeight() {
    const panelHeading = document.querySelector('.panel-heading') as HTMLElement;
    const panelFooter = document.querySelector('.panel-footer') as HTMLElement;

    // 避免某些情况下离开房间时导致的异常
    if (panelHeading && panelFooter) {
      const height = window.innerHeight
        - (+panelHeading.offsetTop)
        - (+panelHeading.clientHeight)
        - (+panelFooter.clientHeight) - 15;

      this.height = `${height}px`;
    }
  }
}
