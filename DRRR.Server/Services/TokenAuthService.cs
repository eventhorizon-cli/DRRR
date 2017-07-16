using DRRR.Server.Auth;
using DRRR.Server.Models;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;

namespace DRRR.Server.Services
{
    public class TokenAuthService
    {
        public TokenAuthService() { }

        /// <summary>
        /// 生成一个新的 Token
        /// </summary>
        /// <param name="user">用户信息</param>
        /// <param name="expiresSpan">Token的有效期</param>
        /// <returns></returns>        
        public string GenerateToken(User user, TimeSpan expiresSpan)
        {
            // 这边的处理是位于多线程中的
            var handler = new JwtSecurityTokenHandler();

            var identity = new ClaimsIdentity(
                new GenericIdentity(user.Username, "TokenAuth"),
                new[] {
                    new Claim("ID", user.ID.ToString())
                }
            );

            // 权限等级设置
            identity.AddClaim(new Claim(ClaimTypes.Role, ((Roles)user.Role).ToString()));

            var expires = DateTime.Now + expiresSpan;

            var securityToken = handler.CreateToken(new SecurityTokenDescriptor
            {
                Issuer = TokenAuthOption.Issuer,
                Audience = TokenAuthOption.Audience,
                SigningCredentials = TokenAuthOption.SigningCredentials,
                Subject = identity,
                Expires = expires
            });
            return handler.WriteToken(securityToken);
        }
    }
}
