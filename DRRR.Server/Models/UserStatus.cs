using System;
using System.Collections.Generic;

namespace DRRR.Server.Models
{
    public partial class UserStatus
    {
        public UserStatus()
        {
            User = new HashSet<User>();
        }

        public int Code { get; set; }
        public string Name { get; set; }

        public ICollection<User> User { get; set; }
    }
}
