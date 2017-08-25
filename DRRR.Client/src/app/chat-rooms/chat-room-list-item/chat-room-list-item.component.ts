import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { ChatRoomDto } from '../dtos/chat-room.dto';

@Component({
  selector: 'app-chat-room-list-item',
  templateUrl: './chat-room-list-item.component.html',
  styleUrls: ['./chat-room-list-item.component.css']
})
export class ChatRoomListItemComponent implements OnInit {

  @Input() room: ChatRoomDto;

  constructor() { }

  ngOnInit() {
    console.log(this.room);
  }

}
