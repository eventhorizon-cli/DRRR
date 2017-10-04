using DRRR.Server.Dtos;
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

        private TokenAuthService _tokenAuthService;

        public UserProfileService(
            DrrrDbContext dbContext,
            SystemMessagesService systemMessagesService,
            TokenAuthService tokenAuthService)
        {
            _dbContext = dbContext;
            _systemMessagesService = systemMessagesService;
            _tokenAuthService = tokenAuthService;
        }

        /// <summary>
        /// 获取头像资源
        /// </summary>
        /// <param name="type">图片类型（原图或者缩略图）</param>
        /// <param name="uid">用户ID</param>
        /// <returns>异步获取用户头像资源的任务</returns>
        public async Task<FileResult> GetAvatarAsync(string type, int uid)
        {
            return await Task.Run<FileResult>(() =>
            {
                string path = Path.Combine(AvatarsDirectory, type, $"{uid}.jpg");

                if (!File.Exists(path))
                {
                    path = Path.Combine(AvatarsDirectory, type, "default.jpg");
                }

                return new FileStreamResult(new MemoryStream(File.ReadAllBytes(path)), "application/x-img");
            });
        }

        /// <summary>
        /// 更新用户头像
        /// </summary>
        /// <param name="uid">用户ID</param>
        /// <param name="avatars">用户上传的头像资源（包括裁剪后的原图和缩略图）</param>
        /// <returns>表示异步更新头像的任务,成功返回true,失败返回false</returns>
        public async Task<bool> UpdateAvatarAsync(int uid, IFormFileCollection avatars)
        {
            string pathOriginal = Path.Combine(AvatarsDirectory, "originals", $"{uid}.jpg");
            string pathThumbnail = Path.Combine(AvatarsDirectory, "thumbnails", $"{uid}.jpg");
            FileStream fsOriginal = null;
            FileStream fsThumbnail = null;
            try
            {
                fsOriginal = File.Create(pathOriginal);
                fsThumbnail = File.Create(pathThumbnail);
                await Task.WhenAll(avatars[0].CopyToAsync(fsOriginal),
                    avatars[1].CopyToAsync(fsThumbnail));
                return true;
            }
            catch (Exception)
            {
                return false;
            }
            finally
            {
                fsOriginal?.Flush();
                fsOriginal?.Close();
                fsThumbnail?.Flush();
                fsThumbnail?.Close();
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

        /// <summary>
        /// 更新用户密码
        /// </summary>
        /// <param name="uid">用户ID</param>
        /// <param name="newPassword">新密码</param>
        /// <returns>用于更新密码的任务，如果成功则返回新的TOKEN</returns>
        public async Task<AccessTokenResponseDto> UpdatePasswordAsync(int uid, string newPassword)
        {
            var user = await _dbContext.User.FindAsync(uid);
            Guid salt = Guid.NewGuid();
            user.Salt = salt;
            user.PasswordHash = PasswordHelper.GeneratePasswordHash(newPassword, salt);
            _dbContext.User.Update(user);
            await _dbContext.SaveChangesAsync();
            return new AccessTokenResponseDto
            {
                AccessToken = _tokenAuthService.GenerateAccessToken(user),
                RefreshToken = _tokenAuthService.GenerateRefreshToken(user)
            };
        }
    }
}
