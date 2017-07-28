import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ChatRoomsRoutingModule } from './chat-rooms-routing.module';

import { ChatRoomListComponent } from './chat-room-list/chat-room-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

@NgModule({
  imports: [
    SharedModule,
    ChatRoomsRoutingModule
  ],
  declarations: [
    ChatRoomListComponent,
    ChatRoomComponent]
})
export class ChatRoomsModule { }
