using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 软删除连接信息请求Dto
    /// </summary>
    public class ConnectionSoftDeleteRequestDto
    {
        /// <summary>
        /// 房间ID
        /// </summary>
        public string RoomId { get; set; }
    }
}
