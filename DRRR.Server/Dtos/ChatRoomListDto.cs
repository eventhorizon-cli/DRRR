using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    public class ChatRoomListDto
    {
        public List<ChatRoomDto> ChatRoomList { get; set; }

        public PaginationDto Pagination { get; set; }
    }
}
