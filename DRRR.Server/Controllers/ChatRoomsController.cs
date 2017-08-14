using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DRRR.Server.Services;
using DRRR.Server.Dtos;
using DRRR.Server.Security;

namespace DRRR.Server.Controllers
{
    [Route("api/rooms")]
    public class ChatRoomsController : Controller
    {
        private ChatRoomService _chatRoomService;
        public ChatRoomsController(ChatRoomService chatRoomService) => _chatRoomService = chatRoomService;

        [HttpGet]
        [JwtAuthorize(Roles.Guest, Roles.User, Roles.Admin)]
        public async Task<ChatRoomSearchResponseDto> GetRoomList(string keyword, int page)
        {
            return await _chatRoomService.GetRoomList(keyword, page);
        }
    }
}
