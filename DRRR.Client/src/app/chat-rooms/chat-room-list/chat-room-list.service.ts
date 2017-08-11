import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../core/services/auth.service';
import { ChatRoomListDto } from '../dtos/chat-room-list.dto';

@Injectable()
export class ChatRoomListService {

  constructor(private auth: AuthService) { }

  getList(keyword: string = '', page: number): Observable<ChatRoomListDto>  {
    return this.auth.http
      .get<ChatRoomListDto>(`api/rooms?keyword=${keyword}&page=${page}`);
  }
}
