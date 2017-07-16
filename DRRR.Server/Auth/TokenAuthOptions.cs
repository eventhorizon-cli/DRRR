using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;

namespace DRRR.Server.Auth
{
    public class TokenAuthOptions
    {
        /// <summary>
        /// Token 签收者
        /// </summary>
        public static string Audience { get; } = "ExampleAudience";

        /// <summary>
        /// Token 签发者
        /// </summary>
        public static string Issuer { get; } = "ExampleIssuer";

        /// <summary>
        /// Token 签发者用签名
        /// </summary>
        public static SigningCredentials SigningCredentials { get; } = new SigningCredentials(RSAKeyHelper.RSAPrivateKey, SecurityAlgorithms.RsaSha256Signature);
    }
}
