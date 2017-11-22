using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 历史聊天记录DTO
    /// </summary>
    public class ChatHistoryDto
    {
        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// 用户名
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// 消息数据（文本或者图片）
        /// </summary>
        public string Data { get; set; }

        /// <summary>
        /// 时间戳
        /// </summary>
        public long Timestamp { get; set; }

        /// <summary>
        /// 是否为图片
        /// </summary>
        public bool IsPicture { get; set; }
    }
}
