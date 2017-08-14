using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DRRR.Server.Services;
using DRRR.Server.Dtos;
using DRRR.Server.Security;

namespace DRRR.Server.Controllers
{
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private UserLoginService _loginService;

        private UserRegisterService _registerService;

        private TokenAuthService _tokenAuthService;

        public UserController(
            UserLoginService loginService,
            UserRegisterService registerService,
            TokenAuthService tokenAuthService)
        {
            _loginService = loginService;
            _registerService = registerService;
            _tokenAuthService = tokenAuthService;
        }

        /// <summary>
        /// 验证登录
        /// </summary>
        /// <param name="userDto">用户信息</param>
        /// <returns>Token或者错误信息</returns>
        [HttpPost("login")]
        public async Task<AccessTokenResponseDto> LoginAsync([FromBody]UserLoginRequestDto userDto)
        {
            return await _loginService.ValidateAsync(userDto);
        }

        /// <summary>
        /// 用户注册
        /// </summary>
        /// <param name="userDto">用户信息</param>
        /// <returns>验证结果</returns>
        [HttpPost, Route("register")]

        public async Task<AccessTokenResponseDto> RegisterAsync([FromBody]UserRegisterRequestDto userDto)
        {
            return await _registerService.RegisterAsync(userDto);
        }

        /// <summary>
        /// 验证用户名
        /// </summary>
        /// <param name="username"></param>
        /// <returns>验证结果</returns>
        [HttpGet, Route("username-validation")]
        public async Task<JsonResult> ValidateUsernameAsync(string username)
        {
            return new JsonResult(new { Error = await _registerService.ValidateUsernameAsync(username) });
        }

        [HttpPost, Route("refresh-token")]
        [JwtAuthorize]
        public async Task<string> RefreshTokenAsync()
        {
            string hashid = HttpContext.User.FindFirst("uid").Value;
            return await _tokenAuthService.RefreshTokenAsync(HashidHelper.Decode(hashid));
        }
    }
}
