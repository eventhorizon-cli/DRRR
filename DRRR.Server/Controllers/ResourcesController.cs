using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DRRR.Server.Services;
using DRRR.Server.Security;
using Newtonsoft.Json.Linq;
using System;

namespace DRRR.Server.Controllers
{
    /// <summary>
    /// 资源控制器
    /// </summary>
    [Route("api/[controller]")]
    public class ResourcesController : Controller
    {
        private SystemMessagesService _msg;

        private UserProfileService _userProfileService;

        public ResourcesController(
            SystemMessagesService systemMessagesService,
            UserProfileService userProfileService)
        {
            _msg = systemMessagesService;
            _userProfileService = userProfileService;
        }

        /// <summary>
        /// 获取客户端的系统通知信息配置
        /// </summary>
        /// <returns>表示获取客户端的系统通知信息配置的任务</returns>
        [HttpGet("system-messages")]
        public async Task<JsonResult> GetSystemMessageSettingsAsync()
        {
            var json = await System.IO.File.ReadAllTextAsync(
                System.IO.Path.Combine(AppContext.BaseDirectory,
                "Resources", "system-messages.client.json"));
            return Json(JObject.Parse(json));
        }

        /// <summary>
        /// 获取用户头像资源
        /// </summary>
        /// <param name="type">图片类型（原图或者缩略图）</param>
        /// <param name="hashid">用户哈希ID</param>
        /// <returns>异步获取用户头像资源的任务</returns>
        [HttpGet("avatars/{type}/{hashid}")]
        public async Task<FileResult> GetAvatarAsync(string type, string hashid) =>
            await _userProfileService.GetAvatarAsync(type, HashidsHelper.Decode(hashid));

        /// <summary>
        /// 更新用户头像资源
        /// </summary>
        /// <param name="hashid">用户哈希ID</param>
        /// <returns>表示用户更新用户头像资源的任务</returns>
        [HttpPut("avatars/{hashid}")]
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task<bool> UpdateAvatarAsync(string hashid) =>
            await _userProfileService
            .UpdateAvatarAsync(HashidsHelper.Decode(hashid), Request.Form.Files);
    }
}
