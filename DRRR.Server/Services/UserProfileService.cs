using DRRR.Server.Models;
using DRRR.Server.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Services
{
    /// <summary>
    /// 用户头像服务
    /// </summary>
    public class UserProfileService
    {
        public static string AvatarDirectory { private get; set; }

        private DrrrDbContext _dbContext;

        public UserProfileService(DrrrDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// 获取头像资源
        /// </summary>
        /// <param name="uid">用户ID</param>
        /// <returns>头像资源</returns>
        public async Task<FileResult> GetAvatarAsync(int uid)
        {
            return await Task.Run<FileResult>(() =>
            {
                string path = Path.Combine(AvatarDirectory, $"{uid}.jpg");

                if (!File.Exists(path))
                {
                    path = Path.Combine(AvatarDirectory, "default.jpg");
                }

                return new FileStreamResult(new MemoryStream(File.ReadAllBytes(path)), "application/x-img");
            });
        }

        /// <summary>
        /// 获取用户注册时间
        /// </summary>
        /// <param name="uid"></param>
        /// <returns></returns>
        public async Task<String> GetRegistrationTimeAsync(int uid)
        {
            return await _dbContext
                .User
                .Where(user => user.Id == uid)
                .Select(user => user.CreateTime.ToString("yyyy/MM/dd"))
                .FirstOrDefaultAsync();
        }
    }
}
