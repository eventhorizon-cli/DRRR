using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using DRRR.Server.Services;

namespace DRRR.Server.Controllers
{
    [Route("api/[controller]")]
    public class ResourcesController : Controller
    {
        private SystemMessagesService _systemMessagesService;

        public ResourcesController(SystemMessagesService systemMessagesService)
        {
            _systemMessagesService = systemMessagesService;
        }

        /// <summary>
        /// 获取客户端的系统通知信息配置
        /// </summary>
        /// <returns></returns>
        [HttpGet, Route("system-messages")]
        public FileResult GetSystemMessageSettings()
        {
            return _systemMessagesService.ClientSystemMessageSettings;
        }
    }
}
