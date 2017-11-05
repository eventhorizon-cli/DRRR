import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { FromEventObservable } from 'rxjs/observable/FromEventObservable';

import { ChatRoomMemberDto } from '../dtos/chat-room-member.dto';

@Component({
  selector: 'app-chat-room-member-list',
  templateUrl: './chat-room-member-list.component.html',
  styleUrls: ['./chat-room-member-list.component.css']
})
export class ChatRoomMemberListComponent implements OnInit, OnDestroy {

  @Input() list: ChatRoomMemberDto[];

  private resizeSubscription: Subscription;

  constructor() { }

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
}
