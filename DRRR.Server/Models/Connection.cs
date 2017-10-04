using System;
using System.Collections.Generic;

namespace DRRR.Server.Models
{
    public partial class Connection
    {
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public Guid ConnectionId { get; set; }
        public DateTime CreateTime { get; set; }
        public DateTime UpdateTime { get; set; }
    }
}
