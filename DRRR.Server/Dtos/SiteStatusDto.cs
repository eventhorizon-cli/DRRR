using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 网站状态DTO
    /// </summary>
    public class SiteStatusDto
    {
        /// <summary>
        /// 当前房间数
        /// </summary>
        public int CurrentRooms { get; set; }

        /// <summary>
        /// 注册用户数
        /// </summary>
        public int RegisteredUsers { get; set; }

        /// <summary>
        /// 在线注册用户数
        /// </summary>
        public int OnlineRegisteredUsers { get; set; }

        /// <summary>
        /// 在线游客数
        /// </summary>
        public int OnlineGuests { get; set; }
    }
}
