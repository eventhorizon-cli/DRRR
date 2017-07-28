import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-room-list',
  templateUrl: './chat-room-list.component.html',
  styleUrls: ['./chat-room-list.component.css']
})
export class ChatRoomListComponent implements OnInit {

  constructor() {
    console.log('被加载了');
  }

  ngOnInit() {
  }

}
