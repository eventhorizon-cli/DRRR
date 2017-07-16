using Newtonsoft.Json;
using System;
using System.IO;
using System.Security.Cryptography;

namespace DRRR.Server.Auth
{
    public class RSAKeyHelper
    {
        /// <summary>
        /// 生成用于作为Jwt秘钥的随机码
        /// </summary>
        /// <returns></returns>
        public static RSAParameters GenerateKey()
        {
            using (RSA rsa = RSA.Create())
            {
                // 长度最低是默认的2048
                return rsa.ExportParameters(true);
            }
        }    
    }
}
