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
        /// 有权访问该资源的用户角色数组
        /// </summary>
        public new Roles[] Roles { get; set; }

        /// <summary>
        /// 对指定资源访问进行JWT认证
        /// </summary>
        public JwtAuthorizeAttribute() : base("Jwt")
        {
            if (Roles == null)
            {
                // 默认对所有通过JWT认证的用户开放
                Roles = new Roles[]
                {
                    Auth.Roles.Guest,
                    Auth.Roles.User,
                    Auth.Roles.Admin
                };
            }

            // 通过逗号分隔
            base.Roles = string.Join(",", Roles);
        }
    }
}
