using System;
using System.Collections.Generic;

namespace DRRR.Server.Models
{
    public partial class User
    {
        public int Id { get; set; }
        public DateTime CreateTime { get; set; }
        public string PasswordHash { get; set; }
        public int RoleId { get; set; }
        public Guid Salt { get; set; }
        public int StatusCode { get; set; }
        public DateTime UpdateTime { get; set; }
        public string Username { get; set; }

        public Role Role { get; set; }
        public UserStatus StatusCodeNavigation { get; set; }
    }
}
