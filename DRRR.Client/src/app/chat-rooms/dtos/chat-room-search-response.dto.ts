import { ChatRoomDto } from './chat-room.dto';
import { PaginationDto } from './pagination.dto';

export interface ChatRoomSearchResponseDto {
  chatRoomList: ChatRoomDto[];
  pagination: PaginationDto;
}
