using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Security.Cryptography;

namespace DRRR.Server.Auth
{
    public class RSAKeyHelper
    {
        /// <summary>
        /// 用于验证的公钥
        /// </summary>
        public static RsaSecurityKey RSAPublicKey { get; private set; }

        /// <summary>
        /// 用于签名的私钥
        /// </summary>
        public static RsaSecurityKey RSAPrivateKey { get; private set; }

        static RSAKeyHelper()
        {
            // 每次启动程序都会重新生成
            using (RSA rsa = RSA.Create())
            {
                RSAPublicKey = new RsaSecurityKey(rsa.ExportParameters(false));
                RSAPrivateKey = new RsaSecurityKey(rsa.ExportParameters(true));
            }
        }
    }
}
