import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { ChatRoomDto } from '../dtos/chat-room.dto';
import { AuthService } from '../../core/services/auth.service';
import { Roles } from '../../core/models/roles.enum';
import { ChatRoomListItemService } from './chat-room-list-item.service';
import { SystemMessagesService } from '../../core/services/system-messages.service';

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

  /**
   * 房主或者是管理员
   */
  ownerOrAdmin: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    private chatRoomListItemService: ChatRoomListItemService,
    private msg: SystemMessagesService,
  ) {
    // 不能放在init事件里，否则会引发异常
    this.failedToJoinTheRoom = new EventEmitter();
  }

  ngOnInit() {
    this.full = this.room.currentUsers === this.room.maxUsers;
    const payLoad = this.auth.getPayloadFromToken('access_token');
    this.ownerOrAdmin = (this.room.ownerName === payLoad.unique_name || payLoad.role === Roles.admin);
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

  /**
   * 删除房间
   */
  deleteRoom() {
    this.msg.showConfirmMessage('warning', this.msg.getMessage('I008'))
      .then(() => {
        this.chatRoomListItemService.deleteRoom(this.room.id)
          .then(() => {
            // 通知列表刷新
            this.failedToJoinTheRoom.next();
            this.failedToJoinTheRoom.unsubscribe();
          });
      }, () => {});
  }
}
