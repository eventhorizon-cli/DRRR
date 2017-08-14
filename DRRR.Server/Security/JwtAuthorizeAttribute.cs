using Microsoft.AspNetCore.Authorization;
using System.Linq;

namespace DRRR.Server.Security
{
    /// <summary>
    /// JWT验证
    /// </summary>
    public class JwtAuthorizeAttribute : AuthorizeAttribute
    {
        /// <summary>
        /// 对指定资源访问进行JWT认证
        /// </summary>
        /// <param name="roles">有权访问该资源的用户角色数组</param>
        public JwtAuthorizeAttribute(params Roles[] roles) : base("Jwt")
        {
            // 如果没有传参数过来的话，默认是个空数组
            // 通过逗号分隔
            if (roles.Count() > 0) Roles = string.Join(",", roles.Select(role => (int)role));
        }
    }
}
