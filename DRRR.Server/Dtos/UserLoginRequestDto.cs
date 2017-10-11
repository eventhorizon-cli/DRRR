namespace DRRR.Server.Dtos
{
    /// <summary>
    /// 用户登录请求DTO
    /// </summary>
    public class UserLoginRequestDto
    {
        /// <summary>
        /// 用户名
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// 密码
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// 是否是游客
        /// </summary>
        public bool IsGuest { get; set; }
    }
}
