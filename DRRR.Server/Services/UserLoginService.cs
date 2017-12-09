using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DRRR.Server.Dtos;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;
using DRRR.Server.Security;
using static DRRR.Server.Security.PasswordHelper;
using System.Web;

namespace DRRR.Server.Services
{
    /// <summary>
    /// 用户登录服务
    /// </summary>
    public class UserLoginService
    {
        private SystemMessagesService _systemMessagesService;

        private TokenAuthService _tokenAuthService;

        private DrrrDbContext _dbContext;

        public UserLoginService(
            SystemMessagesService systemMessagesService,
            TokenAuthService tokenAuthService,
            DrrrDbContext dbcontext)
        {
            _systemMessagesService = systemMessagesService;
            _tokenAuthService = tokenAuthService;
            _dbContext = dbcontext;
        }

        /// <summary>
        /// 作为注册用户登录
        /// </summary>
        /// <param name="userDto">用户信息</param>
        /// <returns>异步获取Token的任务</returns>
        public async Task<AccessTokenResponseDto> LoginAsRegisteredUserAsync(UserLoginRequestDto userDto)
        {
            AccessTokenResponseDto tokenDto = new AccessTokenResponseDto();
            User user = await _dbContext.User
                .Where(u => u.Username == userDto.Username)
                .FirstOrDefaultAsync()
                .ConfigureAwait(false);

            if (user != null
                && ValidatePassword(userDto.Password, user.Salt, user.PasswordHash))
            {
                tokenDto.AccessToken = await _tokenAuthService.GenerateAccessTokenAsync(user);
                tokenDto.RefreshToken = await _tokenAuthService.GenerateRefreshTokenAsync(user);
            }
            else
            {
                // 用户名或密码错误
                tokenDto.Error = _systemMessagesService.GetMessage("E001", "用户名或密码");
            }
            return tokenDto;
        }

        /// <summary>
        /// 作为游客登录
        /// </summary>
        /// <returns>异步获取Token的任务</returns>
        public async Task<AccessTokenResponseDto> LoginAsGuestAsync()
        {
            var guestId = Convert.ToInt32(DateTime.Now.ToString("ddHHmmss") + new Random().Next(0, 9));
            var username = $"游客{HttpUtility.UrlDecode(HashidsHelper.Encode(guestId))}";

            var user = new User
            {
                Id = guestId,
                Username = username,
                RoleId = (int)Roles.Guest
            };
            return new AccessTokenResponseDto
            {
                AccessToken = await _tokenAuthService.GenerateAccessTokenAsync(user),
                RefreshToken = await _tokenAuthService.GenerateRefreshTokenAsync(user)
            };
        }
    }
}
