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
    /// <summary>
    /// 聊天室控制器
    /// </summary>
    [Route("api/rooms")]
    public class ChatRoomsController : Controller
    {
        private ChatRoomService _chatRoomService;
        public ChatRoomsController(ChatRoomService chatRoomService) => _chatRoomService = chatRoomService;

        /// <summary>
        /// 获取房间列表
        /// </summary>
        /// <param name="keyword">关键词</param>
        /// <param name="page">页码</param>
        /// <returns>房间列表</returns>
        [HttpGet]
        [JwtAuthorize(Roles.Guest, Roles.User, Roles.Admin)]
        public async Task<ChatRoomSearchResponseDto> GetRoomList(string keyword, int page)
        {
            return await _chatRoomService.GetRoomList(keyword, page);
        }

        /// <summary>
        /// 验证房间名
        /// </summary>
        /// <param name="name">房间名</param>
        /// <returns>验证结果</returns>
        [HttpGet, Route("room-name-validation")]
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task<JsonResult> ValidateRoomNameAsync(string name)
        {
            return new JsonResult(new
            {
                Error = await _chatRoomService.ValidateRoomNameAsync(name)
            });
        }

        [HttpPost]
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task<JsonResult> CreateRoomAsync([FromBody]ChatRoomDto roomDto)
        {
            string hashid = HttpContext.User.FindFirst("uid").Value;
            return new JsonResult(new
            {
                Error = await _chatRoomService.CreateRoomAsync(HashidHelper.Decode(hashid), roomDto)
            });
        }
    }
}
