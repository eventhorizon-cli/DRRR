import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ChatRoomsRoutingModule } from './chat-rooms-routing.module';

import { ChatRoomListComponent } from './chat-room-list/chat-room-list.component';
import { ChatRoomListItemComponent } from './chat-room-list-item/chat-room-list-item.component';
import { ChatRoomsComponent } from './chat-rooms.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatRoomListService } from './chat-room-list/chat-room-list.service';
import { ChatRoomCreateService } from './chat-room-create/chat-room-create.service';
import { ChatRoomCreateComponent } from './chat-room-create/chat-room-create.component';

@NgModule({
  imports: [
    SharedModule,
    ChatRoomsRoutingModule
  ],
  providers: [
    ChatRoomListService,
    ChatRoomCreateService
  ],
  declarations: [
    ChatRoomListComponent,
    ChatRoomListItemComponent,
    ChatRoomsComponent,
    ProgressBarComponent,
    ChatRoomComponent,
    ChatRoomCreateComponent],
  entryComponents: [
    ChatRoomCreateComponent
  ]
})
export class ChatRoomsModule { }
