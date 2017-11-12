import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { FromEventObservable } from 'rxjs/observable/FromEventObservable';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/delay';

import { ChatRoomService } from './chat-room.service';
import { Message } from '../models/message.model';
import { ChatRoomInitialDisplayDto } from '../dtos/chat-room-initial-display.dto';
import { ChatRoomMemberDto } from '../dtos/chat-room-member.dto';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {

  messages: Observable<Message[]>;

  chatHistory: Observable<Message[]>;

  initialDto: Subject<ChatRoomInitialDisplayDto>;

  noMoreMessage: boolean;

  memberList: Subject<ChatRoomMemberDto[]>;

  isMemberListVisible: boolean;

  onlineUsers: number;

  private msgSubscription: Subscription;

  private resizeSubscription: Subscription;

  private domNodeInsertedSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private chatRoomService: ChatRoomService
  ) {
    // 默认不显示用户列表
    this.isMemberListVisible = false;
  }

  ngOnInit() {
    // 聊天界面窗口高度
    // 一开始的高度
    this.setHeight();
    // 重新设置窗口大小后
    this.resizeSubscription = FromEventObservable.create(window, 'resize')
      .subscribe(() => {
        this.setHeight();
        this.scrollToBottom();
      });

    this.messages = this.chatRoomService.message
      .scan((messages: Message[], message: Message) =>
        messages.concat(message), []);

    // 聊天历史记录
    this.chatHistory = this.chatRoomService.chatHistory
      .delay(0) // 这一步很重要，等下面的高度判断结束了再发射下一条
      .scan((messages: Message[], message: Message) =>
        [message].concat(messages), []);

    // 避免增加历史信息时将下方内容顶下去，
    const scrollPanel = $('.msg-container-base')[0];
    this.domNodeInsertedSubscription
      = FromEventObservable.create<MutationEvent>(scrollPanel, 'DOMNodeInserted')
      .filter(evt => evt.relatedNode instanceof HTMLDivElement
        && evt.relatedNode.classList.contains('history'))
      .scan((hAndHDiff: number[]) => {
        const height = scrollPanel.scrollHeight;
        return [height, height - hAndHDiff[0]];
      }, [scrollPanel.scrollHeight, 0])
      .map(hAndHDiff => hAndHDiff[1])
      .subscribe(hDiff => {
        scrollPanel.scrollTop += hDiff;
      });

    this.msgSubscription = this.messages.subscribe(() => {
      // 消息窗口滚至下方
      this.scrollToBottom();
    });

    this.chatRoomService.onReconnect = () => {
      // 显示用户列表
      this.isMemberListVisible = true;
      this.chatRoomService.getChatHistory()
        .then(count => {
          this.noMoreMessage = count < 20;
          this.scrollToBottom();
        });
    };

    const roomId = this.route.snapshot.params['id'];
    this.chatRoomService.connect(roomId);
    this.initialDto = this.chatRoomService.initialDto;
    this.memberList = this.chatRoomService.memberList;
    this.memberList.subscribe(list => {
      this.onlineUsers = list.filter(x => x.isOnline).length;
    });
  }

  ngOnDestroy() {
    this.msgSubscription.unsubscribe();
    this.resizeSubscription.unsubscribe();
    this.domNodeInsertedSubscription.unsubscribe();
    // 离开房间时关闭连接
    this.chatRoomService.disconnect();
  }

  /**
   * 发送消息
   * @param {HTMLInputElement} message 消息框输入控件
   * @returns {boolean} 返回false避免事件冒泡
   */
  sendMessage(message: HTMLInputElement): boolean | undefined {
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
        this.noMoreMessage = count < 20;
      });
  }

  /**
   * 失去焦点后调节高度（针对移动端）
   */
  onLostFocus() {
    setTimeout(this.setHeight);
  }

  /**
   * 显示或者隐藏成员列表
   */
  showOrHideMemberList() {
    this.isMemberListVisible = !this.isMemberListVisible;
    $('.member-list').toggle();
  }

  /**
   * 房间成员被要求删除
   * @param {string} uid 用户ID
   */
  onMemberRemoved(uid: string) {
    this.chatRoomService.removeMember(uid);
  }

  /**
   * 将消息框内容滚动至最下方
   */
  private scrollToBottom() {
    setTimeout(() => {
      const scrollPanel = $('.msg-container-base');
      scrollPanel.animate({ scrollTop: scrollPanel[0].scrollHeight , speed: 'fast'});
    });
  }

  /**
   * 设置消息容器高度
   */
  private setHeight() {
    const panelHeading = $('.panel-heading');
    const panelFooter = $('.panel-footer');

    const height = window.innerHeight
      - (+panelHeading[0].offsetTop)
      - (+panelHeading[0].clientHeight)
      - (+panelFooter[0].clientHeight) - 50;

    $('.msg-container-base').height(height);
  }
}
