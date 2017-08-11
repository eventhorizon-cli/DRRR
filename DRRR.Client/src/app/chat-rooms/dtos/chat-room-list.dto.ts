import { ChatRoomDto } from './chat-room.dto';
import { PaginationDto } from './pagination.dto';

export interface ChatRoomListDto {
  chatRoomList: ChatRoomDto[];
  pagination: PaginationDto;
}
