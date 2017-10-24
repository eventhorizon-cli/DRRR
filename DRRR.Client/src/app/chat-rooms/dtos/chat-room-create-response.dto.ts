/**
 * 创建房间响应DTO
 */
export interface ChatRoomCreateResponseDto {
  /**
   * 房间ID
   */
  roomId: string;

  /**
   * 错误信息
   */
  error: string;

  /**
   * 是否在发生错误时关闭模态框
   */
  closeModalIfError: boolean;
}
