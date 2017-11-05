import {Component, Input, OnInit} from '@angular/core';
import { ChatRoomMemberDto } from '../dtos/chat-room-member.dto';

@Component({
  selector: 'app-chat-room-member-list-item',
  templateUrl: './chat-room-member-list-item.component.html',
  styleUrls: ['./chat-room-member-list-item.component.css']
})
export class ChatRoomMemberListItemComponent implements OnInit {

  status: string[];

  @Input() memberInfo: ChatRoomMemberDto;

  constructor() { }

  ngOnInit() {
    let status: string;
    if (!this.memberInfo.isOnline) {
      status = 'muted';
    } else if (this.memberInfo.isOwner) {
      status = 'primary';
    } else {
      status = 'success';
    }
    this.status = [`text-${status}`];
  }

}
