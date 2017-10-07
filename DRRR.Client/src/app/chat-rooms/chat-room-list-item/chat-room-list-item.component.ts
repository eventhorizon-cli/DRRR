import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
   * 进入房间失败事件
   */
  @Output() failedToJoinTheRoom: EventEmitter<never>;

  /**
   * 房间是否满员
   */
  full: boolean;

  constructor(
    private router: Router
  ) {
    // 不能放在init事件里，否则会引发
    this.failedToJoinTheRoom = new EventEmitter();
  }

  ngOnInit() {
    this.full = this.room.currentUsers === this.room.maxUsers;
  }

  /**
   * 加入房间
   */
  joinRoom() {
    if (!this.full) {
      this.router.navigateByUrl(`/rooms/${this.room.id}`)
        .catch(() => {
          this.failedToJoinTheRoom.next();
          this.failedToJoinTheRoom.unsubscribe();
        });
    }
  }

}
