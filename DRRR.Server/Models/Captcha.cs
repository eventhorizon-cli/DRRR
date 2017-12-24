using System;
using System.Collections.Generic;

namespace DRRR.Server.Models
{
    public partial class Captcha
    {
        public string Id { get; set; }
        public string Text { get; set; }
        public DateTime CreateTime { get; set; }
    }
}
