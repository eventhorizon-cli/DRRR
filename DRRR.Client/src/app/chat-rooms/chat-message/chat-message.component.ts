import {ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap';

import { Message } from '../models/message.model';
import { ChatPictureComponent } from '../chat-picture/chat-picture.component';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageComponent implements OnInit {
  private static effects: string[]
    = ['bounceIn', 'bounceInUp', 'bounceInDown', 'bounceInLeft', 'bounceInRight',
    'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRight'];

  @Input() message: Message;

  position: 'left' | 'right';

  isToday: boolean;

  constructor(private modalService: BsModalService) { }

  ngOnInit() {
    const msg = this.message;
    this.position = msg.incoming ? 'left' : 'right';

    if (msg.showMessageTime) {
      this.isToday = this.formatDate(new Date()) === this.formatDate(new Date(msg.timestamp));
    }
  }

  showOriginalPicture() {
    const { roomId, userId, timestamp } = this.message;
    // 获取大图用的url
    const originalSrc =
      `/api/resources/chat-pictures/rooms/${roomId}/users/${userId}?timestamp=${timestamp}`;
    // 暂时保存在sessionStorage内
    sessionStorage.setItem('originalSrc', originalSrc);
    const effects = ChatMessageComponent.effects;
    const index = Math.floor(Math.random() * effects.length);
    const effect = effects[index];
    this.modalService.show(ChatPictureComponent, {
      animated: false,
      class: `picture-modal-dialog animated ${effect}`
    });
  }

  /**
   * 把给定的日期格式化为yyyyMMdd格式
   * @param {Date} date
   * @return {string} yyyyMMdd格式的日期字符串
   */
  private formatDate(date: Date): string {
    // js里月份需要加1
    return date.getFullYear()
      + (date.getMonth() + 1).toString().padStart(2, '0')
      + date.getDate().toString().padStart(2, '0');
  }
}
