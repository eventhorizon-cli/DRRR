using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DRRR.Server.Services;
using DRRR.Server.Dtos;

namespace DRRR.Server.Controllers
{
    [Route("api/[controller]")]
    public class UserController
    {
        private UserLoginService _loginService;

        private UserRegisterService _registerService;

        public UserController(
            UserLoginService loginService,
            UserRegisterService registerService)
        {
            _loginService = loginService;
            _registerService = registerService;
        }

        [HttpPost("login")]

        public async Task<AccessTokenDto> LoginAsync([FromBody]UserDto userDto)
        {
            return await _loginService.ValidateAsync(userDto);
        }

        [HttpPost, Route("register")]

        public async Task<AccessTokenDto> RegisterAsync([FromBody]UserDto userDto)
        {
            return await _registerService.RegisterAsync(userDto);
        }

        [HttpGet, Route("username-validation/{username}")]
        public async Task<JsonResult> ValidateUsernameAsync(string username)
        {
            return new JsonResult(new { Error = await _registerService.ValidateUsernameAsync(username) });
        }
    }
}
