/**
 * 验证房间密码请求DTO
 */
export interface ChatRoomPasswordValidationResponseDto {
  /**
   * 验证房间密码响应DTO
   */
  error: string;

  /**
   * 是否需要刷新
   */
  refreshRequired: boolean;
}
