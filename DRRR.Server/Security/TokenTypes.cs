using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Security
{
    /// <summary>
    /// 令牌类型
    /// </summary>
    public enum TokenTypes
    {
        /// <summary>
        /// 访问令牌
        /// </summary>
        AccessToken,

        /// <summary>
        /// 更新令牌
        /// </summary>
        RefreshToken
    }
}
