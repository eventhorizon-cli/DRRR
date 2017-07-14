using DRRR.Server.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Services
{
    public class LoginService
    {
        private SystemMessagesService _systemMessagesService;

        public LoginService(SystemMessagesService systemMessagesService)
        {
            _systemMessagesService = systemMessagesService;
        }

        /// <summary>
        /// 验证登录信息
        /// </summary>
        public LoginResultDto Validate(UserDto userDto)
        {
            LoginResultDto result = new LoginResultDto();
            result.Error = "测试错误信息";
            return result;
        }
    }
}
