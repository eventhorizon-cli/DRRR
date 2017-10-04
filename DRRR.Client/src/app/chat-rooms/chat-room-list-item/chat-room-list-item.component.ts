import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { ChatRoomDto } from '../dtos/chat-room.dto';

@Component({
  selector: 'app-chat-room-list-item',
  templateUrl: './chat-room-list-item.component.html',
  styleUrls: ['./chat-room-list-item.component.css']
})
export class ChatRoomListItemComponent implements OnInit {

  @Input() room: ChatRoomDto;

  /**
   * 房间是否满员
   */
  full: boolean;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.full = this.room.currentUsers === this.room.maxUsers;
  }

  /**
   * 加入房间
   */
  joinRoom() {
    if (!this.full) {
      this.router.navigateByUrl(`/rooms/${this.room.id}`);
    }
  }

}
