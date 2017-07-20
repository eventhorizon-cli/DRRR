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

        public async Task<LoginResultDto> Login([FromBody]UserDto userDto)
        {
            return await _loginService.Validate(userDto);
        }

        [HttpPost, Route("register")]

        public async Task<LoginResultDto> Register([FromBody]UserDto userDto)
        {
            return await _loginService.Validate(userDto);
        }

        [HttpGet, Route("username-validation/{username}")]
        public JsonResult ValidateUsername(string username)
        {
            return new JsonResult(new { Error = _registerService.ValidateUsername(username) });
        }
    }
}
