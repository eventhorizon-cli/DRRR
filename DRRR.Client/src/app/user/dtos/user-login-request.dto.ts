/**
 * 用户登录请求DTO
 */
export interface UserLoginRequestDto {
  /**
   * 用户名
   */
  username?: string;

  /**
   * 密码
   */
  password?: string;

  /**
   * 是否是游客
   */
  isGuest: boolean;

  /**
   * 是否记住登录状态
   */
  rememberMe: boolean;
}
