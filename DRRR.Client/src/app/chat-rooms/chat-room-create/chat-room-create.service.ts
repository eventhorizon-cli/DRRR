import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable'

import { AuthService } from '../../core/services/auth.service';
import { ChatRoomDto } from '../dtos/chat-room.dto';

@Injectable()
export class ChatRoomCreateService {

  constructor(
    private auth: AuthService
  ) { }

  /**
   * 验证房间名
   * @param {string} name 房间名
   * @returns {Observable<{error: string}>} 验证结果
   */
  validateRoomName(name: string): Observable<{error: string}> {
    return this.auth.http
      .get<{error: string}>(`api/rooms/room-name-validation?name=${name}`);
  }

  /**
   * 创建房间
   * @param {ChatRoomDto} roomInfo 房间信息
   * @returns {Observable<{error：string}>}
   */
  createRoom(roomInfo: ChatRoomDto): Observable<{error: string}> {
    return this.auth.http.post<{error: string}>('api/rooms', roomInfo);
  }
}
