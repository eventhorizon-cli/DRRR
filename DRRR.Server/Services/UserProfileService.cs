using DRRR.Server.Models;
using DRRR.Server.Security;
using Microsoft.AspNetCore.Http;
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
        /// <summary>
        /// 存放头像的目录
        /// </summary>
        public static string AvatarsDirectory { private get; set; }

        private DrrrDbContext _dbContext;

        private SystemMessagesService _systemMessagesService;

        public UserProfileService(
            DrrrDbContext dbContext,
            SystemMessagesService systemMessagesService)
        {
            _dbContext = dbContext;
            _systemMessagesService = systemMessagesService;
        }

        /// <summary>
        /// 获取头像资源
        /// </summary>
        /// <param name="uid">用户ID</param>
        /// <returns>异步获取用户头像资源的任务</returns>
        public async Task<FileResult> GetAvatarAsync(int uid)
        {
            return await Task.Run<FileResult>(() =>
            {
                string path = Path.Combine(AvatarsDirectory, $"{uid}.jpg");

                if (!File.Exists(path))
                {
                    path = Path.Combine(AvatarsDirectory, "default.jpg");
                }

                return new FileStreamResult(new MemoryStream(File.ReadAllBytes(path)), "application/x-img");
            });
        }

        /// <summary>
        /// 更新用户头像
        /// </summary>
        /// <param name="uid">用户ID</param>
        /// <param name="avatar">头像文件资源</param>
        /// <returns>表示异步更新头像的任务</returns>
        public async Task UpdateAvatarAsync(int uid, IFormFile avatar)
        {
            string path = Path.Combine(AvatarsDirectory, $"{uid}.jpg");
            using (FileStream fs = File.Create(path))
            {
                await avatar.CopyToAsync(fs);
                fs.Flush();
            }
        }

        /// <summary>
        /// 获取用户注册时间
        /// </summary>
        /// <param name="uid"></param>
        /// <returns>异步获取用户注册时间的任务</returns>
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
