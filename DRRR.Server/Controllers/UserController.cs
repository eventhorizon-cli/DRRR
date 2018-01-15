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
        private readonly UserLoginService _loginService;

        private readonly UserRegisterService _registerService;

        private readonly TokenAuthService _tokenAuthService;

        private readonly UserProfileService _userProfileService;

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
        public async Task<JsonResult> LoginAsync([FromBody]UserLoginRequestDto userDto)
        {
            if (!userDto.IsGuest)
            {
                var (token, error) = await _loginService.LoginAsRegisteredUserAsync(userDto);
                return error == null ? Json(token)
                                     : Json(new { Error = error });
            }
            else
            {
                return Json(await _loginService.LoginAsGuestAsync());
            }
        }

        /// <summary>
        /// 用户注册
        /// </summary>
        /// <param name="userDto">用户信息</param>
        /// <returns>异步获取Token的任务</returns>
        [HttpPost("register")]
        public async Task<JsonResult> RegisterAsync([FromBody]UserRegisterRequestDto userDto)
        {
            var (token, error) = await _registerService.RegisterAsync(userDto);

            return error == null ? Json(token)
                                 : Json(new { Error = error });
        }

        /// <summary>
        /// 验证用户名
        /// </summary>
        /// <param name="username"></param>
        /// <returns>验证结果</returns>
        [HttpGet("username-validation")]
        public async Task<JsonResult> ValidateUsernameAsync(string username)
        {
            return Json(new { Error = await _registerService.ValidateUsernameAsync(username) });
        }

        /// <summary>
        /// 刷新访问令牌
        /// </summary>
        /// <returns>获取新的访问令牌的任务</returns>
        [HttpPost("refresh-token")]
        [JwtAuthorize]
        public async Task<JsonResult> RefreshTokenAsync()
        {
            string hashid = User.FindFirst("uid").Value;
            return Json(new
            {
                AccessToken = await _tokenAuthService.RefreshTokenAsync(HashidsHelper.Decode(hashid))
            });
        }

        /// <summary>
        /// 获取用户注册时间
        /// </summary>
        /// <returns>获取用户注册时间的任务</returns>
        [HttpGet("registration-time")]
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task<string> GetRegistrationTimeAsync()
        {
            string hashid = User.FindFirst("uid").Value;
            return await _userProfileService.GetRegistrationTimeAsync(HashidsHelper.Decode(hashid));
        }

        /// <summary>
        /// 更新用户密码
        /// </summary>
        /// <param name="password">新密码</param>
        /// <returns>用于更新密码的任务，如果成功则返回新的TOKEN</returns>
        [HttpPost("password")]
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task<AccessTokenResponseDto> UpdatePasswordAsync([FromBody]UserUpdatePasswordRequestDto passwordDto)
        {
            string hashid = User.FindFirst("uid").Value;
            return await _userProfileService.UpdatePasswordAsync(HashidsHelper.Decode(hashid), passwordDto.NewPassword);
        }
    }
}
