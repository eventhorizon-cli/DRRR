using System;
using System.Collections.Generic;

namespace DRRR.Server.Models
{
    public partial class User
    {
        public User()
        {
            ChatRoom = new HashSet<ChatRoom>();
        }

        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string Salt { get; set; }
        public int RoleId { get; set; }
        public int StatusCode { get; set; }
        public DateTimeOffset CreateTime { get; set; }
        public DateTimeOffset UpdateTime { get; set; }

        public Role Role { get; set; }
        public UserStatus Status { get; set; }
        public ICollection<ChatRoom> ChatRoom { get; set; }
    }
}
