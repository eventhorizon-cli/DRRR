using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DRRR.Server.Dtos;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;
using DRRR.Server.Security;
using static DRRR.Server.Security.PasswordHelper;

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
        /// 验证登录信息
        /// </summary>
        /// <param name="userDto">用户信息</param>
        /// <returns>验证结果</returns>
        public async Task<AccessTokenResponseDto> ValidateAsync(UserLoginRequestDto userDto)
        {
            AccessTokenResponseDto tokenDto = new AccessTokenResponseDto();
            User user = await _dbContext.User
                .Where(u => u.Username == userDto.Username)
                .FirstOrDefaultAsync()
                .ConfigureAwait(false);

            if (user != null
                && ValidatePassword(userDto.Password, user.Salt, user.PasswordHash))
            {
                tokenDto.AccessToken = _tokenAuthService.GenerateAccessToken(user);
                tokenDto.RefreshToken = _tokenAuthService.GenerateRefreshToken(user);
            }
            else
            {
                // 用户名或密码错误
                tokenDto.Error = _systemMessagesService.GetServerSystemMessage("E001", "用户名或密码");
            }
            return tokenDto;
        }
    }
}
