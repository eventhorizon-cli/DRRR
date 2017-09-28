using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace DRRR.Server.Security
{
    /// <summary>
    /// 哈希密码帮助类
    /// </summary>
    public static class PasswordHelper
    {
        /// <summary>
        /// 生成哈希密码
        /// </summary>
        /// <param name="pwd">加密前的密码</param>
        /// <param name="salt">盐</param>
        /// <returns></returns>
        public static string GeneratePasswordHash(string pwd, Guid salt)
        {
            byte[] passwordAndSaltBytes = Encoding.UTF8.GetBytes(pwd + salt.ToString());
            byte[] hashBytes = SHA256.Create().ComputeHash(passwordAndSaltBytes);
            string hashString = Convert.ToBase64String(hashBytes);
            return hashString;
        }

        /// <summary>
        /// 验证密码
        /// </summary>
        /// <param name="pwd">加密前的密码</param>
        /// <param name="salt">盐</param>
        /// <param name="pwdHash">哈希密码</param>
        /// <returns></returns>
        public static bool ValidatePassword(string pwd, Guid salt, string pwdHash)
        {
            return GeneratePasswordHash(pwd, salt) == pwdHash;
        }
    }
}
