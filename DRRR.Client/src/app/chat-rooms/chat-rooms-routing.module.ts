import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatRoomListComponent  } from './chat-room-list/chat-room-list.component';

const ChatRoomsRouts: Routes = [
  {
    path: '',
    component : ChatRoomListComponent,
    pathMatch: 'full'
  }];

@NgModule({
  imports: [
    RouterModule.forChild(ChatRoomsRouts)
  ],
  exports: [RouterModule]
})
export class ChatRoomsRoutingModule { }
