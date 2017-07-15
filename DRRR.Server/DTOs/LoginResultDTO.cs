using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.DTOs
{
    public class LoginResultDTO
    {
        /// <summary>
        /// 错误信息
        /// </summary>
        public string Error { get; set; }

        /// <summary>
        /// 令牌
        /// </summary>
        public string Token { get; set; }
    }
}
