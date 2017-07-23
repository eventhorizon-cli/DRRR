using DRRR.Server.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Services
{
    public class UserLoginService
    {
        private SystemMessagesService _systemMessagesService;

        private TokenAuthService _tokenAuthService;

        public UserLoginService(
            SystemMessagesService systemMessagesService,
            TokenAuthService tokenAuthService)
        {
            _systemMessagesService = systemMessagesService;
            _tokenAuthService = tokenAuthService;
        }

        /// <summary>
        /// 验证登录信息
        /// </summary>
        public async Task<LoginResultDto> Validate(UserDto userDto)
        {
            return await Task.Run(() =>
            {
                LoginResultDto result = new LoginResultDto();
                if (userDto.Username == "1" && userDto.Password == "2")
                {
                    //result.Token = _tokenAuthService
                    //    .GenerateToken(new Models.User() { ID = "123", Role = 1 , Username = "普通用户" },TimeSpan.FromMinutes(20));
                }
                else
                {
                    // 用户名或密码错误
                    result.Error = _systemMessagesService.GetServerSystemMessage("E001");
                }
                return result;
            });
        }
    }
}
