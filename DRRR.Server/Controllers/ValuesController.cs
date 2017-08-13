using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DRRR.Server.Security;

namespace DRRR.Server.Controllers
{
    [Route("api/[controller]")]
    public class ValuesController : Controller
    {
        // GET api/values
        [HttpGet]
        [JwtAuthorize]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        [JwtAuthorize(Roles.Admin)]
        // GET api/values/admin/5
        [HttpGet, Route("admin/{id}")]
        public string GetAdmin(int id)
        {
            return "admin" + id;
        }

        [JwtAuthorize(Roles.User)]
        // GET api/values/user/5
        [HttpGet("user/{id}")]
        public string GetUser(int id)
        {
            return "user" + id;
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
