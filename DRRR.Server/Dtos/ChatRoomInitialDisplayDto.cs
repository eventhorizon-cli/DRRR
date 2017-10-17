using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 房间初期显示DTO
    /// </summary>
    public class ChatRoomInitialDisplayDto
    {
        /// <summary>
        /// 房间名
        /// </summary>
        public string RoomName { get; set; }

        /// <summary>
        /// 进入房间的时间（时间戳）
        /// </summary>
        public long EntryTime { get; set; }
    }
}
