export interface UserRegisterRequestDto {
  /**
   * 用户名
   */
  username: string;

  /**
   * 密码
   */
  password: string;

  /**
   * 验证码ID
   */
  captchaId: string;

  /**
   * 验证码文本
   */
  captchaText: string;
}
