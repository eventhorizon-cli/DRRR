using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DRRR.Server.Dtos;
using DRRR.Server.Models;
using DRRR.Server.Security;
using static DRRR.Server.Security.PasswordHelper;

namespace DRRR.Server.Services
{
    /// <summary>
    /// 用户注册服务
    /// </summary>
    public class UserRegisterService
    {
        private SystemMessagesService _systemMessagesService;

        private TokenAuthService _tokenAuthService;

        private DrrrDbContext _dbContext;

        public UserRegisterService(
            SystemMessagesService systemMessagesService,
            TokenAuthService tokenAuthService,
            DrrrDbContext dbContext)
        {
            _systemMessagesService = systemMessagesService;
            _tokenAuthService = tokenAuthService;
            _dbContext = dbContext;
        }

        /// <summary>
        /// 验证用户名
        /// </summary>
        /// <param name="username">用户名</param>
        /// <returns>表示异步验证用户名的任务</returns>
        public async Task<string> ValidateUsernameAsync(string username = "")
        {
            // 用户名仅支持中日英文、数字和下划线,且不能为纯数字
            if (!Regex.IsMatch(username, @"^[\u4e00-\u9fa5\u3040-\u309F\u30A0-\u30FFa-zA-Z_\d]+$")
            || Regex.IsMatch(username, @"^\d+$"))
            {
                return _systemMessagesService.GetServerSystemMessage("E002", "用户名");
            }

            // 检测用户名是否存在
            int count = await _dbContext
                .User.CountAsync(user => user.Username == username)
                .ConfigureAwait(false);

            if (count > 0)
            {
                return _systemMessagesService.GetServerSystemMessage("E003", "用户名");
            }
            return null;
        }

        /// <summary>
        /// 用户注册
        /// </summary>
        /// <param name="userDto">用于注册的用户信息</param>
        /// <returns>异步获取Token的任务</returns>
        public async Task<AccessTokenResponseDto> RegisterAsync(UserRegisterRequestDto userDto)
        {
            // 因为前台可以按下回车就可以提交表单，所以可能一开始没check住
            var error = await ValidateUsernameAsync(userDto.Username);
            if (error != null)
            {
                return new AccessTokenResponseDto
                {
                    Error = error
                };
            }

            try
            {
                Guid salt = Guid.NewGuid();
                var user = new User
                {
                    Username = userDto.Username,
                    PasswordHash = GeneratePasswordHash(userDto.Password, salt),
                    Salt = salt,
                    // 默认为普通用户
                    RoleId = (int)Roles.User
                };
                _dbContext.User.Add(user);
                await _dbContext.SaveChangesAsync().ConfigureAwait(false);

                return new AccessTokenResponseDto
                {
                    AccessToken = await _tokenAuthService.GenerateAccessTokenAsync(user),
                    RefreshToken = await _tokenAuthService.GenerateRefreshTokenAsync(user)
                };
            }
            catch
            {
                // 因为是多线程，依旧可能用户名重复
                // 用户名重复会导致异常
                return new AccessTokenResponseDto
                {
                    Error = _systemMessagesService.GetServerSystemMessage("E003", "用户名")
                };
            }
        }
    }
}
