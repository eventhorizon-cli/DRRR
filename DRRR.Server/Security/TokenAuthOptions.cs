using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;

namespace DRRR.Server.Security
{
    /// <summary>
    /// JWT配置选项
    /// </summary>
    public static class TokenAuthOptions
    {
        /// <summary>
        /// Token 签收者
        /// </summary>
        public static string Audience { get; set; }

        /// <summary>
        /// Token 签发者
        /// </summary>
        public static string Issuer { get; set; }

        /// <summary>
        /// Token 签发者用签名
        /// </summary>
        public static SigningCredentials SigningCredentials { get; } = new SigningCredentials(RSAKeyHelper.RSAPrivateKey, SecurityAlgorithms.RsaSha256Signature);

        /// <summary>
        /// Token 有效期
        /// </summary>
        public static TimeSpan ExpiresIn { get; set; }

        /// <summary>
        /// 更新Token 有效期
        /// </summary>
        public static TimeSpan RefreshTokenExpiresIn { get; set; }
    }
}
