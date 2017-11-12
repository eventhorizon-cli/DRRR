import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ChatRoomMemberDto } from '../dtos/chat-room-member.dto';
import { SystemMessagesService } from '../../core/services/system-messages.service';

@Component({
  selector: 'app-chat-room-member-list-item',
  templateUrl: './chat-room-member-list-item.component.html',
  styleUrls: ['./chat-room-member-list-item.component.css']
})
export class ChatRoomMemberListItemComponent implements OnInit {

  @Input() memberInfo: ChatRoomMemberDto;

  @Input() showDropDownMenu: boolean;

  @Output() remove: EventEmitter<string>;

  status: string[];

  constructor(private msg: SystemMessagesService) {
    this.remove = new EventEmitter();
  }

  ngOnInit() {
    let status: string;
    if (!this.memberInfo.isOnline) {
      status = 'offline';
    } else if (this.memberInfo.isOwner) {
      status = 'owner';
    } else {
      status = 'online';
    }
    this.status = [status];
  }

  onRemove() {
    this.msg.showConfirmMessage('warning',
      this.msg.getMessage('I012', this.memberInfo.username))
      .then(res => {
        if (res) {
          this.remove.emit(this.memberInfo.userId);
        }
      }, () => {});
    // 阻止a标签默认行为
    return false;
  }
}
