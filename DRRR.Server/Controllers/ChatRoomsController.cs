using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DRRR.Server.Services;
using DRRR.Server.Dtos;

namespace DRRR.Server.Controllers
{
    [Route("api/rooms")]
    public class ChatRoomsController : Controller
    {
        private ChatRoomService _chatRoomService;
        public ChatRoomsController(ChatRoomService chatRoomService)
        {
            _chatRoomService = chatRoomService;
        }

        [HttpGet]
        public async Task<ChatRoomListDto> GetRoomList(string keyword, int page)
        {
            return await _chatRoomService.GetRoomList(keyword, page);
        }
    }
}
