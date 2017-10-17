using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 申请进入房间响应DTO
    /// </summary>
    public class ChatRoomEntryPermissionResponseDto
    {
        /// <summary>
        /// 错误信息
        /// </summary>
        public string Error { get; set; }

        /// <summary>
        /// 是否需要密码
        /// </summary>
        public bool? PasswordRequired { get; set; }

        /// <summary>
        /// 是否允许游客进入
        /// </summary>
        public bool AllowGuest { get; set; }
    }
}
