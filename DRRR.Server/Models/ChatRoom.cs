using System;
using System.Collections.Generic;

namespace DRRR.Server.Models
{
    public partial class ChatRoom
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int OwnerId { get; set; }
        public int MaxUsers { get; set; }
        public int CurrentUsers { get; set; }
        public bool? IsEncrypted { get; set; }
        public string Salt { get; set; }
        public string PasswordHash { get; set; }
        public bool? IsHidden { get; set; }
        public bool? IsPermanent { get; set; }
        public bool? AllowGuest { get; set; }
        public DateTime CreateTime { get; set; }
        public DateTime UpdateTime { get; set; }

        public User Owner { get; set; }
    }
}
