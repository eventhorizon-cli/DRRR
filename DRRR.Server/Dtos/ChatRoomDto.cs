using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    public class ChatRoomDto
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string OwnerName { get; set; }

        public int MaxUsers { get; set; }

        public int CurrentUsers { get; set; }

        public bool IsEncrypted { get; set; }

        public bool IsPermanent { get; set; }

        public bool IsHidden { get; set; }
    }
}
