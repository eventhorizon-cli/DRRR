import { Component, Input, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { FromEventObservable } from 'rxjs/observable/FromEventObservable';

import { ChatRoomMemberDto } from '../dtos/chat-room-member.dto';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-chat-room-member-list',
  templateUrl: './chat-room-member-list.component.html',
  styleUrls: ['./chat-room-member-list.component.css']
})
export class ChatRoomMemberListComponent implements OnInit, OnDestroy {

  @Input() list: ChatRoomMemberDto[];

  @Input() ownerId: string;

  @Output() memberRemoved: EventEmitter<string>;

  // 当前登录用户的ID
  currentUserId: string;

  private resizeSubscription: Subscription;

  constructor(auth: AuthService) {
    this.currentUserId = auth.getPayloadFromToken('access_token').uid;
    this.memberRemoved = new EventEmitter();
  }

  ngOnInit() {
    this.setWidth();
    // 重新设置窗口大小后
    this.resizeSubscription = FromEventObservable.create(window, 'resize')
      .subscribe(() => {
        this.setWidth();
      });

  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

  setWidth() {
    const memberList = $('.member-list');
    memberList.width($('.msg-container-base').width());
  }

  onRemove(uid: string) {
    this.memberRemoved.emit(uid);
  }
}
