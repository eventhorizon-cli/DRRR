using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Security.Cryptography;

namespace DRRR.Server.Security
{
    /// <summary>
    /// RSA秘钥帮助类
    /// </summary>
    public static class RSAKeyHelper
    {
        /// <summary>
        /// 用于签名的私钥
        /// </summary>
        public static RsaSecurityKey RSAPrivateKey { get; }

        /// <summary>
        /// 用于验证的公钥
        /// </summary>
        public static RsaSecurityKey RSAPublicKey { get; }

        static RSAKeyHelper()
        {
            // 判断是否存在保存key的文件，不存在的话，重新生成
            var keyDir = Path.Combine(AppContext.BaseDirectory, "Keys");
            var keyDirInfo = new DirectoryInfo(keyDir);
            if (keyDirInfo.Exists && keyDirInfo.GetFiles().Length == 2)
            {
                RSAPrivateKey
                    = new RsaSecurityKey(GetParameters(keyDir, true));
                RSAPublicKey
                    = new RsaSecurityKey(GetParameters(keyDir, false));
            }
            else
            {
                keyDirInfo.Create();
                using (var rsa = new RSACryptoServiceProvider(2048))
                {
                    RSAPrivateKey = new RsaSecurityKey(ExportAndSaveParameters(keyDir, true, rsa));
                    RSAPublicKey = new RsaSecurityKey(ExportAndSaveParameters(keyDir, false, rsa));
                    rsa.PersistKeyInCsp = false;
                }
            }
        }

        /// <summary>
        /// 从json文件中获取生成key用的参数
        /// </summary>
        /// <param name="keyDir">json文件所在目录</param>
        /// <param name="includePrivateParameters">是否包含私钥参数</param>
        /// <returns>生成key用的参数</returns>
        private static RSAParameters GetParameters(string keyDir, bool includePrivateParameters) =>
            JsonConvert.DeserializeObject<RSAParameters>(File.ReadAllText(Path
                .Combine(keyDir, $"key.{(includePrivateParameters ? "private" : "public")}.json")),
                new JsonSerializerSettings() { ContractResolver = new RsaKeyContractResolver() });

        /// <summary>
        /// 生成key用的参数并将其保存到json文件中去
        /// </summary>
        /// <param name="keyDir">json文件所在目录</param>
        /// <param name="includePrivateParameters">是否包含私钥参数</param>
        /// <param name="rsa">RSA实例</param> 
        /// <returns>生成key用的参数</returns>
        private static RSAParameters ExportAndSaveParameters(string keyDir, bool includePrivateParameters, RSACryptoServiceProvider rsa)
        {
            var parameters = rsa.ExportParameters(includePrivateParameters);
            File.WriteAllText(Path.Combine(keyDir,
                $"key.{(includePrivateParameters ? "private" : "public")}.json"),
                JsonConvert.SerializeObject(parameters,
                new JsonSerializerSettings() { ContractResolver = new RsaKeyContractResolver() }));
            return parameters;
        }
    }
}
