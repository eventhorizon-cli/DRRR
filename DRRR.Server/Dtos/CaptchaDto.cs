using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 验证码DTO
    /// </summary>
    public class CaptchaDto
    {
        /// <summary>
        /// 验证码ID
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// base64编码的验证码图片
        /// </summary>
        public string Image { get; set; }
    }
}
