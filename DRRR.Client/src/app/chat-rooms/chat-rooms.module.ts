import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ChatRoomsRoutingModule } from './chat-rooms-routing.module';

import { ChatRoomListComponent } from './chat-room-list/chat-room-list.component';
import { ChatRoomListItemComponent } from './chat-room-list-item/chat-room-list-item.component';
import { ChatRoomsComponent } from './chat-rooms.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatRoomListService } from './chat-room-list/chat-room-list.service';

@NgModule({
  imports: [
    SharedModule,
    ChatRoomsRoutingModule
  ],
  providers: [ChatRoomListService],
  declarations: [
    ChatRoomListComponent,
    ChatRoomListItemComponent,
    ChatRoomsComponent,
    ProgressBarComponent,
    ChatRoomComponent]
})
export class ChatRoomsModule { }
