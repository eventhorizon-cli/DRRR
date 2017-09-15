using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

using DRRR.Server.Services;
using DRRR.Server.Security;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace DRRR.Server.Controllers
{
    /// <summary>
    /// 资源控制器
    /// </summary>
    [Route("api/[controller]")]
    public class ResourcesController : Controller
    {
        private SystemMessagesService _systemMessagesService;

        private UserProfileService _userProfileService;

        public ResourcesController(
            SystemMessagesService systemMessagesService,
            UserProfileService userProfileService)
        {
            _systemMessagesService = systemMessagesService;
            _userProfileService = userProfileService;
        }

        /// <summary>
        /// 获取客户端的系统通知信息配置
        /// </summary>
        /// <returns>客户端的系统通知信息配置</returns>
        [HttpGet, Route("system-messages")]
        public JsonResult GetSystemMessageSettings()
        {
            return _systemMessagesService.ClientSystemMessageSettings;
        }

        /// <summary>
        /// 获取用户头像资源
        /// </summary>
        /// <param name="hashid"></param>
        /// <returns>异步获取用户头像资源的任务</returns>
        [HttpGet, Route("Avatars/{hashid}")]
        public async Task<FileResult> GetAvatarAsync(string hashid)
        {
            return await _userProfileService.GetAvatarAsync(HashidHelper.Decode(hashid));
        }

        /// <summary>
        /// 更新用户头像资源
        /// </summary>
        /// <param name="avatar">用户上传的头像资源</param>
        /// <returns>表示用户更新用户头像资源的任务</returns>
        [HttpPut, Route("Avatars")]
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task UpdateAvatarAsync(IFormFile avatar)
        {
            var file = Request.Form.Files;
            string hashid = HttpContext.User.FindFirst("uid").Value;
            await _userProfileService.UpdateAvatarAsync(HashidHelper.Decode(hashid), avatar);
        }
    }
}
