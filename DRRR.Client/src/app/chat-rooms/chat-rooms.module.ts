import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ChatRoomsRoutingModule } from './chat-rooms-routing.module';

import { ChatRoomListComponent } from './chat-room-list/chat-room-list.component';
import { ChatRoomListItemComponent } from './chat-room-list-item/chat-room-list-item.component';
import { ChatRoomMainComponent } from './chat-room-main/chat-room-main.component';
import { ChatRoomsComponent } from './chat-rooms.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';

@NgModule({
  imports: [
    SharedModule,
    ChatRoomsRoutingModule
  ],
  declarations: [
    ChatRoomListComponent,
    ChatRoomListItemComponent,
    ChatRoomMainComponent,
    ChatRoomsComponent,
    ProgressBarComponent]
})
export class ChatRoomsModule { }
