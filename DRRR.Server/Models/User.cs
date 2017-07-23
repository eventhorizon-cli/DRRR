using System;
using System.Collections.Generic;

namespace DRRR.Server.Models
{
    public partial class User
    {
        public int Id { get; set; }
        public DateTime CreateTime { get; set; }
        public string Password { get; set; }
        public int RoleId { get; set; }
        public int StatusCode { get; set; }
        public DateTime UpdateTime { get; set; }
        public string Username { get; set; }
    }
}
