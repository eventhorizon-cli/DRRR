/**
 * 申请进入房间响应DTO
 */
export interface ChatRoomEntryPermissionResponseDto {
  /**
   * 错误信息
   */
  error: string;

  /**
   * 是否需要密码
   */
  passwordRequired: boolean;

  /**
   * 是否允许游客进入
   */
  allowGuest: boolean;
}
