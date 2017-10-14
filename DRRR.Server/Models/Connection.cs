using System;
using System.Collections.Generic;

namespace DRRR.Server.Models
{
    public partial class Connection
    {
        public int RoomId { get; set; }
        public int UserId { get; set; }
        public string ConnectionId { get; set; }
        public bool? IsOnline { get; set; }
        public bool? IsGuest { get; set; }
        public DateTime CreateTime { get; set; }
        public DateTime UpdateTime { get; set; }
    }
}
