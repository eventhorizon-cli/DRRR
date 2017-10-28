import { Injectable, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../core/services/auth.service';
import { ChatRoomSearchResponseDto } from '../dtos/chat-room-search-response.dto';

@Injectable()
export class ChatRoomListService {

  constructor(private auth: AuthService) { }

  /**
   * 获取房间列表
   * @param {string} keyword 关键词
   * @param {number} page 页码
   * @return {Observable<ChatRoomSearchResponseDto>} 房间列表响应DTO
   */
  getList(keyword: string = '', page: number): Observable<ChatRoomSearchResponseDto> {
    return this.auth.http
      .get<ChatRoomSearchResponseDto>(`api/rooms?keyword=${encodeURIComponent(keyword)}&page=${page}`);
  }

  /**
   * 申请创建房间
   * @return {Observable<{error: string}>} 申请创建房间失败时返回的错误信息
   */
  applyForCreatingRoom(): Observable<{error: string}> {
    return this.auth.http.get<{error: string}>('api/rooms/creating-permission');
  }
}
