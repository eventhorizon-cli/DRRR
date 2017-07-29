using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DRRR.Server.Dtos;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;
using DRRR.Server.Auth;
using static DRRR.Server.Auth.PasswordHelper;

namespace DRRR.Server.Services
{
    public class UserLoginService
    {
        private SystemMessagesService _systemMessagesService;

        private TokenAuthService _tokenAuthService;

        private DrrrDbContext _dbcontext;

        public UserLoginService(
            SystemMessagesService systemMessagesService,
            TokenAuthService tokenAuthService,
            DrrrDbContext dbcontext)
        {
            _systemMessagesService = systemMessagesService;
            _tokenAuthService = tokenAuthService;
            _dbcontext = dbcontext;
        }

        /// <summary>
        /// 验证登录信息
        /// </summary>
        /// <param name="userDto">用户信息</param>
        /// <returns>验证结果</returns>
        public async Task<AccessTokenDto> ValidateAsync(UserDto userDto)
        {
            AccessTokenDto result = new AccessTokenDto();
            User user = await _dbcontext.User
                .Where(u => u.Username == userDto.Username)
                .FirstOrDefaultAsync();

            if (user != null
                && ValidatePassword(userDto.Password, user.Salt, user.PasswordHash))
            {
                result.Token = _tokenAuthService
                    .GenerateToken(user, TimeSpan.FromMinutes(30));
            }
            else
            {
                // 用户名或密码错误
                result.Error = _systemMessagesService.GetServerSystemMessage("E001");
            }
            return result;
        }
    }
}
