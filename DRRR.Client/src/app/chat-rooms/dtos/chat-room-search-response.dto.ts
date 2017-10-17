import { ChatRoomDto } from './chat-room.dto';
import { PaginationDto } from './pagination.dto';

/**
 * 聊天室列表检索响应DTO
 */
export interface ChatRoomSearchResponseDto {
  /**
   * 聊天室列表
   */
  chatRoomList: ChatRoomDto[];

  /**
   * 分页信息
   */
  pagination: PaginationDto;
}
