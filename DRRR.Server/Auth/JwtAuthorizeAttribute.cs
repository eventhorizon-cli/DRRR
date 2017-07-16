using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Auth
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
            // 默认对所有通过JWT认证的用户开放
            roles = roles ?? new[] { Auth.Roles.Guest, Auth.Roles.User, Auth.Roles.Admin };
            // 通过逗号分隔
            base.Roles = string.Join(",", Roles);
        }
    }
}
