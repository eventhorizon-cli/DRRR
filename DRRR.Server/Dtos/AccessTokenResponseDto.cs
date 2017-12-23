using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// Token响应DTO
    /// </summary>
    public class AccessTokenResponseDto
    {
        /// <summary>
        /// 访问令牌
        /// </summary>
        public string AccessToken { get; set; }

        /// <summary>
        /// 更新令牌
        /// </summary>
        public string RefreshToken { get; set; }
    }
}
