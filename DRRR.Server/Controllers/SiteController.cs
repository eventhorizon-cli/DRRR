using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DRRR.Server.Services;
using DRRR.Server.Security;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using DRRR.Server.Dtos;

namespace DRRR.Server.Controllers
{
    /// <summary>
    /// 网站信息控制器
    /// </summary>
    [Route("api/[controller]")]
    public class SiteController : Controller
    {
        SiteInfoService _siteInfoService;

        public SiteController(SiteInfoService siteInfoService)
        {
            _siteInfoService = siteInfoService;
        }

        /// <summary>
        /// 获取网站状态
        /// </summary>
        /// <returns>表示获取网站状态的任务</returns>
        [HttpGet, Route("status")]
        [JwtAuthorize(Roles.Guest, Roles.User, Roles.Admin)]
        public async Task<SiteStatusDto> GetSiteStatusAsync()
        {
            return await _siteInfoService.GetSiteStatusAsync();
        }
    }
}
