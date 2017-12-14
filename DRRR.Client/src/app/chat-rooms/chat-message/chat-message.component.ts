import { Component, Input, OnInit } from '@angular/core';

import { Message } from '../models/message.model';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {

  @Input() message: Message;

  position: 'left' | 'right';

  isToday: boolean;

  constructor() { }

  ngOnInit() {
    this.position = this.message.incoming ? 'left' : 'right';

    if (this.message.timestamp) {
      this.isToday = this.formatDate(new Date()) === this.formatDate(new Date(this.message.timestamp));
    }
  }

  /**
   * 把给定的日期格式化为yyyyMMdd格式
   * @param {Date} date
   * @return {string} yyyyMMdd格式的日期字符串
   */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}${date.getMonth()}${date.getDay()}`;
  }
}
