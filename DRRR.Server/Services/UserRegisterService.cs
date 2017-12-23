using System;
using System.Collections.Generic;
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
        private SystemMessagesService _msg;

        private TokenAuthService _tokenAuthService;

        private DrrrDbContext _dbContext;

        public UserRegisterService(
            SystemMessagesService systemMessagesService,
            TokenAuthService tokenAuthService,
            DrrrDbContext dbContext)
        {
            _msg = systemMessagesService;
            _tokenAuthService = tokenAuthService;
            _dbContext = dbContext;
        }

        /// <summary>
        /// 验证用户名
        /// </summary>
        /// <param name="username">用户名</param>
        /// <returns>表示异步验证用户名的任务</returns>
        public async Task<string> ValidateUsernameAsync(string username)
        {
            // 用户名仅支持中日英文、数字和下划线,且不能为纯数字
            if (!Regex.IsMatch(username, @"^[\u4e00-\u9fa5\u3040-\u309F\u30A0-\u30FFa-zA-Z_\d]+$")
            || Regex.IsMatch(username, @"^\d+$"))
            {
                return _msg.GetMessage("E002", "用户名");
            }

            // 检测用户名是否存在
            int count = await _dbContext
                .User.CountAsync(user => user.Username == username)
                .ConfigureAwait(false);

            if (count > 0)
            {
                return _msg.GetMessage("E003", "用户名");
            }
            return null;
        }

        /// <summary>
        /// 用户注册
        /// </summary>
        /// <param name="userDto">用于注册的用户信息</param>
        /// <returns>异步获取Token的任务，如果发生异常则会返回错误信息</returns>
        public async Task<(AccessTokenResponseDto, Dictionary<string, string>)> RegisterAsync(UserRegisterRequestDto userDto)
        {
            // 如果用户不是通过浏览器在请求接口，失去焦点时验证用户名的动作就没意义
            var error = await ValidateUsernameAsync(userDto.Username).ConfigureAwait(false);
            if (error != null)
            {
                return (null, new Dictionary<string, string>
                {
                    ["username"] = error
                });
            }

            try
            {
                Guid salt = Guid.NewGuid();
                var user = new User
                {
                    Username = userDto.Username,
                    PasswordHash = GeneratePasswordHash(userDto.Password, salt.ToString()),
                    Salt = salt.ToString(),
                    // 默认为普通用户
                    RoleId = (int)Roles.User
                };
                _dbContext.User.Add(user);
                await _dbContext.SaveChangesAsync().ConfigureAwait(false);

                var token = new AccessTokenResponseDto
                {
                    AccessToken = await _tokenAuthService.GenerateAccessTokenAsync(user),
                    RefreshToken = await _tokenAuthService.GenerateRefreshTokenAsync(user)
                };
                return (token, null);
            }
            catch
            {
                // 因为是多线程，依旧可能用户名重复
                // 用户名重复会导致异常
                return (null, new Dictionary<string, string>
                {
                    ["username"] = _msg.GetMessage("E003", "用户名")
                });
            }
        }


        /// <summary>
        /// 异步获取验证码
        /// </summary>
        /// <returns></returns>
        public async Task<string> GetCaptchaAsync()
        {
            var (bytes, captchaText) = await CaptchaHelper.CreateImageAsync();
            return $"{Convert.ToBase64String(bytes)}.{captchaText}";
        }
    }
}
