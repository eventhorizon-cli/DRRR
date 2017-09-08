using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

using DRRR.Server.Services;
using DRRR.Server.Security;

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
        /// <returns></returns>
        [HttpGet, Route("system-messages")]
        public JsonResult GetSystemMessageSettings()
        {
            return _systemMessagesService.ClientSystemMessageSettings;
        }

        [HttpGet, Route("Avatars/{hashid}")]
        public async Task<FileResult> GetAvatarAsync(string hashid)
        {
            return await _userProfileService.GetAvatarAsync(HashidHelper.Decode(hashid));
        }
    }
}
