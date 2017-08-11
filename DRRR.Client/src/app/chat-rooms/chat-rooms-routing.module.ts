import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatRoomsComponent } from './chat-rooms.component';
import { ChatRoomListComponent } from './chat-room-list/chat-room-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

const ChatRoomsRouts: Routes = [
  {
    path: '',
    component: ChatRoomsComponent,
    children: [
      { path: '', component: ChatRoomListComponent },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(ChatRoomsRouts)
  ],
  exports: [RouterModule]
})
export class ChatRoomsRoutingModule { }
