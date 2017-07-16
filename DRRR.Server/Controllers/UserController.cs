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
        private LoginService _loginService;

        public UserController(LoginService loginService)
        {
            _loginService = loginService;
        }

        [HttpPost, Route("login")]

        public async Task<LoginResultDto> Login([FromBody]UserDto userDto)
        {
            return await _loginService.Validate(userDto);
        }

        [HttpPost, Route("register")]

        public async Task<LoginResultDto> Register([FromBody]UserDto userDto)
        {
            return await _loginService.Validate(userDto);
        }

        //[HttpGet, Route("validation/username/{username}")]

        //public async Task<LoginResultDto> ValidateUsername(string username)
        //{
        //    return await _loginService.ValidateUsername(username);
        //}
    }
}
