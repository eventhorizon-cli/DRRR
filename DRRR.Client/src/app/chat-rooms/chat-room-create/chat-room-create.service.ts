import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable'

import { AuthService } from '../../core/services/auth.service';
import { ChatRoomDto } from '../dtos/chat-room.dto';
import { ChatRoomCreateResponseDto } from '../dtos/chat-room-create-response.dto';

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
      .get<{error: string}>(`api/rooms/room-name-validation?name=${encodeURIComponent(name)}`);
  }

  /**
   * 创建房间
   * @param {ChatRoomDto} roomInfo 房间信息
   * @returns {Observable<ChatRoomCreateResponseDto>} 创建房间的请求的响应DTO
   */
  createRoom(roomInfo: ChatRoomDto): Observable<ChatRoomCreateResponseDto> {
    return this.auth.http.post<ChatRoomCreateResponseDto>('api/rooms', roomInfo);
  }
}
