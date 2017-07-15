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
        public LoginResultDTO Validate(UserDto userDto)
        {
            LoginResultDTO result = new LoginResultDTO();
            result.Error = _systemMessagesService.GetServerSystemMessage("E001");
            return result;
        }
    }
}
