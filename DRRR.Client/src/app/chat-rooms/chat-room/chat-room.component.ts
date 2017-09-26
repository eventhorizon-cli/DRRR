import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ChatRoomService } from './chat-room.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private chatRoomService: ChatRoomService
  ) { }

  ngOnInit() {
    const roomId = this.route.snapshot.params['id'];
    this.chatRoomService.connect(roomId);
  }

}
