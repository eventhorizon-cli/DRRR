import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as Cropper from 'cropperjs';

import swal from 'sweetalert2';

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
import { SystemMessagesService } from '../../core/services/system-messages.service';

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

  onlineUsers: Observable<number>;

  lastMessage: Message;

  // 是否让滚动条固定在底部
  fixedAtBottom: boolean;

  private msgSubscription: Subscription;

  private resizeSubscription: Subscription;

  private domNodeInsertedSubscription: Subscription;

  private scrollSubscription: Subscription;

  private isLoadingHistory: boolean;

  constructor(
    private chatRoomService: ChatRoomService,
    private route: ActivatedRoute,
    private msg: SystemMessagesService
  ) {
    // 默认不显示用户列表
    this.isMemberListVisible = false;

    this.fixedAtBottom = true;
  }

  ngOnInit() {
    // 聊天界面窗口高度
    // 一开始的高度
    this.setHeight();

    // 设置滚动条样式
    const scrollPanel$ = $('.msg-container-base');
    (<any>scrollPanel$).niceScroll({cursorcolor: '#d6d6d4'});

    // 重新设置窗口大小后
    this.resizeSubscription = FromEventObservable.create(window, 'resize')
      .subscribe(() => {
        this.setHeight();
        (<any>scrollPanel$).getNiceScroll().resize();
        if (this.fixedAtBottom) {
          this.scrollToBottom();
        }
      });

    // 避免查看聊天信息的时候有新消息会导致被迫滚到最下面
    const scrollPanel = scrollPanel$[0];
    this.scrollSubscription
      = FromEventObservable.create<Event>(scrollPanel, 'scroll')
        .scan((topAndTopDiff: number[]) => {
          const scrollTop = scrollPanel.scrollTop;
          return [scrollTop, scrollTop - topAndTopDiff[0]];
        }, [0, 0])
        .map(topAndTopDiff => topAndTopDiff[1])
        .subscribe(diff => {
          if (diff < 0) {
            // 如果用户进行了向上滚的动作
            this.fixedAtBottom = false;
          } else if (scrollPanel.scrollTop + scrollPanel.clientHeight >= scrollPanel.scrollHeight) {
            // 如果滚动到底了
            this.fixedAtBottom = true;
            this.lastMessage = null;
          }
        });

    this.chatRoomService.onReconnect = () => {
      // 上次显示新消息的时间
      let lastTime: number;

      // 显示用户列表
      this.isMemberListVisible = true;

      this.messages = this.chatRoomService.message
        .scan((messages: Message[], message: Message) => {
          const now = Date.now();
          if (!lastTime || (now - lastTime > 60000)) {
            lastTime = now;
            message.timestamp = now;
          }
          // 用于在下方显示最新的未读信息
          this.lastMessage = message;
          return messages.concat(message);
        }, []);

      // 聊天历史记录
      this.chatHistory = this.chatRoomService.chatHistory
        .scan((messages: Message[], message: Message) =>
          [message].concat(messages), []);

      this.msgSubscription = this.messages.subscribe(() => {
        if (this.fixedAtBottom) {
          this.lastMessage = null;
          // 消息窗口滚至下方
          this.scrollToBottom();
        }
      });

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
    this.onlineUsers =  this.memberList.map(list => {
      return list.filter(member => member.isOnline).length;
    });
  }

  ngOnDestroy() {
    this.chatRoomService.onReconnect = null;

    this.msgSubscription.unsubscribe();
    this.resizeSubscription.unsubscribe();
    if (this.domNodeInsertedSubscription) {
      this.domNodeInsertedSubscription.unsubscribe();
    }
    this.scrollSubscription.unsubscribe();
    // 离开房间时关闭连接
    this.chatRoomService.disconnect();
  }

  /**
   * 发送消息
   * @param {HTMLInputElement} message 消息框输入控件
   * @returns {boolean} 返回false避免事件冒泡
   */
  sendMessage(message: HTMLInputElement): boolean {
    this.fixedAtBottom = true;
    this.scrollToBottom();
    if (message.value && message.value.length <= 200) {
      this.chatRoomService.sendMessage(message);
    }
    return false;
  }

  /**
   * 显示更多历史消息
   */
  showMoreChatHistory() {
    if (this.isLoadingHistory) {
      return;
    }
    this.isLoadingHistory = true;
    // 避免增加历史信息时将下方内容顶下去，
    const scrollPanel = $('.msg-container-base')[0];
    const div = $('.history:first-child')[0];
    if (this.domNodeInsertedSubscription) {
      this.domNodeInsertedSubscription.unsubscribe();
    }
    this.domNodeInsertedSubscription
      = FromEventObservable.create<MutationEvent>(scrollPanel, 'DOMNodeInserted')
        .filter(evt => evt.relatedNode instanceof HTMLDivElement
          && evt.relatedNode.classList.contains('history'))
        .subscribe(() => {
          div.scrollIntoView();
        });
    this.chatRoomService.getChatHistory()
      .then(count => {
        this.noMoreMessage = count < 20;
        this.isLoadingHistory = false;
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
   * 发送图片
   * @param {HTMLInputElement} file input的dom对象
   */
  sendPicture(file: HTMLInputElement) {
    this.fixedAtBottom = true;

    let cropper: Cropper;

    let image: HTMLImageElement;

    const url = URL.createObjectURL(file.files[0]);
    // 清空value值,避免两次选中同样的文件时不触发change事件
    file.value = '';

    // 设置图像显示区域的最大高度和最大宽度
    // 当前设备屏幕的一半
    // 不应该用screen.availWidth，在safari上判断会失败
    // 因为在html上设置过width=device-width，所以可以用width=device-width得到准确数据
    const length = Math.min(window.innerWidth - 60, 460);
    swal({
      title: '发送图片',
      html: `
        <div class="img-container">
          <img src="${url}" style="max-height: ${length}px;max-width: ${length}px">
        </div>`,
      showCloseButton: true,
      showCancelButton: true,
      showLoaderOnConfirm: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      allowOutsideClick: false,
      onOpen() {
        image = $('.img-container img')[0] as HTMLImageElement;
        cropper = new Cropper(image, {
          viewMode: 2,
          dragMode: 'move',
          autoCropArea: 1,
          minContainerWidth: length,
          minContainerHeight: length
        });
      },
      preConfirm: () => {
        return new Promise((resolve, reject) => {
          // 图片最大高度为360，最大宽度为640
          const { height: croppedHeight, width: croppedWidth } = cropper.getCropBoxData();
          let height = Math.min(croppedHeight, image.naturalHeight, 360);
          let width = croppedWidth / croppedHeight * height;
          const widthTmp = Math.min(croppedWidth, image.naturalWidth, 640);
          if (width > widthTmp) {
            width = widthTmp;
            height = croppedHeight / croppedWidth * widthTmp;
          }
          const dataURL = cropper
            .getCroppedCanvas({ height, width })
            .toDataURL('image/jpeg');
          this.chatRoomService.sendPicture(dataURL.split(',')[1])
            .then(() => resolve())
            .catch(error => reject(this.msg.getMessage('E004', '图片发送')));
        });
      },
    }).then(() => {
      // 释放资源
      URL.revokeObjectURL(url);
    }, () => {
      // 取消按钮被按下
      // 释放资源
      URL.revokeObjectURL(url);
    });
  }

  /**
   * 将消息框内容滚动至最下方
   */
  private scrollToBottom() {
    setTimeout(() => {
      const scrollPanel = $('.msg-container-base');
      scrollPanel.animate({ scrollTop: scrollPanel[0].scrollHeight, speed: 'fast' });
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
