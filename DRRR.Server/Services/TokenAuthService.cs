using DRRR.Server.Security;
using DRRR.Server.Models;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;
using System.Web;

namespace DRRR.Server.Services
{
    public class TokenAuthService
    {
        public TokenAuthService() { }

        /// <summary>
        /// 生成一个新的 Token
        /// </summary>
        /// <param name="user">用户信息</param>
        /// <returns>新的 Token</returns>        
        public string GenerateToken(User user)
        {
            // 这边的处理是位于多线程中的
            var handler = new JwtSecurityTokenHandler();

            // 如果不进行URL编码，当用户名中含非ASCII字符时，前台用atob解码base64将导致异常
            var urlEncodedUserName = HttpUtility.UrlEncode(user.Username);

            var identity = new ClaimsIdentity(new GenericIdentity(urlEncodedUserName, "TokenAuth"));

            // 设定用户ID
            identity.AddClaim(new Claim("user_id", HashidHelper.Encode(user.Id)));

            // 设定权限信息
            identity.AddClaim(new Claim(ClaimTypes.Role, user.RoleId.ToString()));

            // 签发时间
            DateTime issuedAt = DateTime.Now;

            var securityToken = handler.CreateToken(new SecurityTokenDescriptor
            {
                IssuedAt = issuedAt,
                Issuer = TokenAuthOptions.Issuer,
                Audience = TokenAuthOptions.Audience,
                SigningCredentials = TokenAuthOptions.SigningCredentials,
                Subject = identity,
                // 到期时间
                Expires = issuedAt + TokenAuthOptions.ExpiresIn
            });
            return handler.WriteToken(securityToken);
        }
    }
}
