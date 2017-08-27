import { Injectable, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../core/services/auth.service';
import { ChatRoomSearchResponseDto } from '../dtos/chat-room-search-response.dto';

@Injectable()
export class ChatRoomListService {

  constructor(private auth: AuthService) { }

  getList(keyword: string = '', page: number): Observable<ChatRoomSearchResponseDto> {
    return this.auth.http
      .get<ChatRoomSearchResponseDto>(`api/rooms?keyword=${keyword}&page=${page}`);
  }
}
