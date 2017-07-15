using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DRRR.Server.Services;
using DRRR.Server.DTOs;

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

        public LoginResultDTO Login([FromBody]UserDTO userDTO)
        {
            return _loginService.Validate(userDTO);
        }
    }
}
