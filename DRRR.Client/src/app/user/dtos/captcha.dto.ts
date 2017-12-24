export interface CaptchaDto {
  /**
   * 验证码ID
   */
  id: string;

  /**
   * base64编码的验证码图片
   */
  image: string;
}
