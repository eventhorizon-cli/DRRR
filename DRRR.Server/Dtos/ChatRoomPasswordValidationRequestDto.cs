using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 验证房间密码请求DTO
    /// </summary>
    public class ChatRoomPasswordValidationRequestDto
    {
        /// <summary>
        /// 房间ID
        /// </summary>
        public string RoomId { get; set; }

        /// <summary>
        /// 密码
        /// </summary>
        public string Password { get; set; }
    }
}
