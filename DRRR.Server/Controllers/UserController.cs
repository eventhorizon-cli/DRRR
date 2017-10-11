using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DRRR.Server.Services;
using DRRR.Server.Dtos;
using DRRR.Server.Security;

namespace DRRR.Server.Controllers
{
    /// <summary>
    /// 用户控制器
    /// </summary>
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private UserLoginService _loginService;

        private UserRegisterService _registerService;

        private TokenAuthService _tokenAuthService;

        private UserProfileService _userProfileService;

        public UserController(
            UserLoginService loginService,
            UserRegisterService registerService,
            TokenAuthService tokenAuthService,
            UserProfileService userProfileService)
        {
            _loginService = loginService;
            _registerService = registerService;
            _tokenAuthService = tokenAuthService;
            _userProfileService = userProfileService;
        }

        /// <summary>
        /// 验证登录
        /// </summary>
        /// <param name="userDto">用户信息</param>
        /// <returns>异步获取Token的任务</returns>
        [HttpPost("login")]
        public async Task<AccessTokenResponseDto> LoginAsync([FromBody]UserLoginRequestDto userDto)
        {
            if (!userDto.IsGuest)
            {
                return await _loginService.LoginAsRegisteredUserAsync(userDto);
            }
            else
            {
                return await _loginService.LoginAsGuestAsync();
            }
        }

        /// <summary>
        /// 用户注册
        /// </summary>
        /// <param name="userDto">用户信息</param>
        /// <returns>异步获取Token的任务</returns>
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

        /// <summary>
        /// 刷新访问令牌
        /// </summary>
        /// <returns>获取新的访问令牌的任务</returns>
        [HttpPost, Route("refresh-token")]
        [JwtAuthorize]
        public async Task<JsonResult> RefreshTokenAsync()
        {
            string hashid = HttpContext.User.FindFirst("uid").Value;
            return new JsonResult(new
            {
                AccessToken = await _tokenAuthService.RefreshTokenAsync(HashidsHelper.Decode(hashid))
            });
        }

        /// <summary>
        /// 获取用户注册时间
        /// </summary>
        /// <returns>获取用户注册时间的任务</returns>
        [HttpGet, Route("registration-time")]
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task<string> GetRegistrationTimeAsync()
        {
            string hashid = HttpContext.User.FindFirst("uid").Value;
            return await _userProfileService.GetRegistrationTimeAsync(HashidsHelper.Decode(hashid));
        }

        /// <summary>
        /// 更新用户密码
        /// </summary>
        /// <param name="password">新密码</param>
        /// <returns>用于更新密码的任务，如果成功则返回新的TOKEN</returns>
        [HttpPost, Route("password")]
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task<AccessTokenResponseDto> UpdatePasswordAsync([FromBody]UserUpdatePasswordRequestDto passwordDto)
        {
            string hashid = HttpContext.User.FindFirst("uid").Value;
            return await _userProfileService.UpdatePasswordAsync(HashidsHelper.Decode(hashid), passwordDto.NewPassword);
        }
    }
}
