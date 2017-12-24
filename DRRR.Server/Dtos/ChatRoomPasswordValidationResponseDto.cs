using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 验证房间密码响应DTO
    /// </summary>
    public class ChatRoomPasswordValidationResponseDto
    {
        /// <summary>
        /// 错误信息
        /// </summary>
        public string Error { get; set; }

        /// <summary>
        /// 是否需要刷新
        /// </summary>
        public bool? RefreshRequired { get; set; }
    }
}
