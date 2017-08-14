export interface AccessTokenResponseDto {
  /**
   * 错误信息
   */
  error: string;

  /**
   * 访问令牌
   */
  accessToken: string;

  /**
   * 更新令牌
   */
  refreshToken: string;
}
