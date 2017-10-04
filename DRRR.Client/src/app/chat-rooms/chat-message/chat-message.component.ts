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

  constructor() { }

  ngOnInit() {
    this.position = this.message.incoming ? 'left' : 'right';
  }

}
