using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 房间成员DTO
    /// </summary>
    public class ChatRoomMemberDto
    {
        /// <summary>
        /// 用户ID（哈希ID）
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// 用户名
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// 是否在线
        /// </summary>
        public bool IsOnline { get; set; }

        /// <summary>
        /// 是否是房主
        /// </summary>
        public bool IsOwner { get; set; }
    }
}
