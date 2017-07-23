using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace DRRR.Server.Services
{
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

        public string ValidateUsername(string username = "")
        {
            // 用户名仅支持中日英文、数字和下划线,且不能为纯数字
            if (!Regex.IsMatch(username, @"^[\u4e00-\u9fa5\u3040-\u309F\u30A0-\u30FFa-zA-Z_\d]+$")
            || Regex.IsMatch(username, @"^\d+$"))
            {
                return _systemMessagesService.GetServerSystemMessage("E002");
            }

            // 检测用户名是否存在

            int count = _dbContext.User.Count(user => user.Username == username);

            if (count > 0)
            {
                return _systemMessagesService.GetServerSystemMessage("E003");
            }
            return null;
        }
    }
}
