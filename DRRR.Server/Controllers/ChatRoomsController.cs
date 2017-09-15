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
        /// <returns>表示异步获取房间列表的任务，如果创建失败则返回错误信息</returns>
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
        /// <returns>异步获取验证结果的任务</returns>
        [HttpGet, Route("room-name-validation")]
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task<JsonResult> ValidateRoomNameAsync(string name)
        {
            return new JsonResult(new
            {
                Error = await _chatRoomService.ValidateRoomNameAsync(name)
            });
        }

        /// <summary>
        /// 创建房间
        /// </summary>
        /// <param name="roomDto">用户输入的用于创建房间的信息</param>
        /// <returns>表示异步创建房间的任务，如果创建失败则返回错误信息</returns>
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
