import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatRoomsAuthGuard } from './chat-rooms-auth.guard';
import { ChatRoomsComponent } from './chat-rooms.component';
import { ChatRoomListComponent } from './chat-room-list/chat-room-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatRoomAuthGuard } from './chat-room-auth.guard';

const ChatRoomsRouts: Routes = [
  {
    path: '',
    component: ChatRoomsComponent,
    canActivate: [ChatRoomsAuthGuard],
    children: [
      { path: '', component: ChatRoomListComponent },
    ]
  },
  {
    path: ':id',
    component: ChatRoomComponent,
    canActivate: [ChatRoomAuthGuard],
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(ChatRoomsRouts)
  ],
  exports: [RouterModule]
})
export class ChatRoomsRoutingModule { }
