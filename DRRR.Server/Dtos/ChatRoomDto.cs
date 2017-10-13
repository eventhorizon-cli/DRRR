using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 聊天室信息DTO
    /// </summary>
    public class ChatRoomDto
    {
        /// <summary>
        /// ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// 房间名
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 房主名
        /// </summary>
        public string OwnerName { get; set; }

        /// <summary>
        /// 最大用户数
        /// </summary>
        public int MaxUsers { get; set; }

        /// <summary>
        /// 当前用户数
        /// </summary>
        public int CurrentUsers { get; set; }

        /// <summary>
        /// 是否为加密房
        /// </summary>
        public bool IsEncrypted { get; set; }

        /// <summary>
        /// 密码
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// 是否为永久房
        /// </summary>
        public bool IsPermanent { get; set; }

        /// <summary>
        /// 是否为隐藏房
        /// </summary>
        public bool IsHidden { get; set; }

        /// <summary>
        /// 是否允许游客进入
        /// </summary>
        public bool AllowGuest { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public long CreateTime { get; set; }
    }
}
