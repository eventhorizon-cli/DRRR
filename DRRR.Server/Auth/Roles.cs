using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Auth
{
    /// <summary>
    /// 用户角色
    /// </summary>
    public enum Roles
    {
        /// <summary>
        /// 游客
        /// </summary>
        Guest,

        /// <summary>
        /// 普通用户
        /// </summary>
        User,

        /// <summary>
        /// 管理员
        /// </summary>
        Admin
    }
}
