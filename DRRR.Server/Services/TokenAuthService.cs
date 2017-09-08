using DRRR.Server.Security;
using DRRR.Server.Models;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;
using System.Web;
using System.Threading.Tasks;

namespace DRRR.Server.Services
{
    /// <summary>
    /// 颁发TOKEN的服务
    /// </summary>
    public class TokenAuthService
    {
        private DrrrDbContext _dbContext;

        public TokenAuthService(DrrrDbContext dbContext) => _dbContext = dbContext;

        /// <summary>
        /// 生成一个新的 AccessToken
        /// </summary>
        /// <param name="user">用户信息</param>
        /// <param name="user"></param>
        /// <returns>一个新的 AccessToken</returns>
        public string GenerateAccessToken(User user) => GenerateToken(user, TokenKind.AccessToken);

        /// <summary>
        /// 生成一个新的 RefreshToken
        /// </summary>
        /// <param name="user">用户信息</param>
        /// <returns>一个新的 RefreshToken</returns>
        public string GenerateRefreshToken(User user) => GenerateToken(user, TokenKind.RefreshToken);

        /// <summary>
        /// 更新令牌
        /// </summary>
        /// <param name="uid">用户ID</param>
        /// <returns>一个新的 AccessToken</returns>
        public async Task<string> RefreshTokenAsync(int uid)
        {
            User user = await _dbContext.User.FindAsync(uid)
                .ConfigureAwait(false);
            return GenerateAccessToken(user);
        }

        /// <summary>
        /// 生成一个新的 Token
        /// </summary>
        /// <param name="user">用户信息</param>
        /// <param name="tokenKind">令牌类型</param> 
        /// <returns>新的 Token</returns>        
        private string GenerateToken(User user, TokenKind tokenKind)
        {
            // 这边的处理是位于多线程中的
            var handler = new JwtSecurityTokenHandler();

            // 如果不进行URL编码，当用户名中含非ASCII字符时，前台用atob解码base64将导致异常
            var urlEncodedUserName = HttpUtility.UrlEncode(user.Username);

            var identity = new ClaimsIdentity(new GenericIdentity(urlEncodedUserName, tokenKind.ToString()));

            // 设定用户ID
            identity.AddClaim(new Claim("uid", HashidHelper.Encode(user.Id)));

            // 有效期
            TimeSpan expiresIn;

            if (tokenKind == TokenKind.AccessToken)
            {
                // 设定权限信息
                identity.AddClaim(new Claim(ClaimTypes.Role, user.RoleId.ToString()));

                expiresIn = TokenAuthOptions.ExpiresIn;
            }
            else
            {
                expiresIn = TokenAuthOptions.RefreshTokenExpiresIn;
            }

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
                Expires = issuedAt + expiresIn
            });
            return handler.WriteToken(securityToken);
        }
    }
}
