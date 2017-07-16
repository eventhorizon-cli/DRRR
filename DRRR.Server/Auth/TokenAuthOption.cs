using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;

namespace DRRR.Server.Auth
{
    public class TokenAuthOption
    {
        public static string Audience { get; } = "ExampleAudience";
        public static string Issuer { get; } = "ExampleIssuer";
        public static RsaSecurityKey Key { get; } = new RsaSecurityKey(RSAKeyHelper.GenerateKey());
        public static SigningCredentials SigningCredentials { get; } = new SigningCredentials(Key, SecurityAlgorithms.RsaSha256Signature);
    }
}
