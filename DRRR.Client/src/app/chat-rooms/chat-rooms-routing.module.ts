import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatRoomsComponent } from './chat-rooms.component';
import { ChatRoomListComponent } from './chat-room-list/chat-room-list.component';
import { ChatRoomMainComponent } from './chat-room-main/chat-room-main.component';

const ChatRoomsRouts: Routes = [
  {
    path: '',
    component: ChatRoomsComponent,
    children: [
      { path: '', redirectTo: 'page/1' },
      { path: 'page/:page', component: ChatRoomListComponent },
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
