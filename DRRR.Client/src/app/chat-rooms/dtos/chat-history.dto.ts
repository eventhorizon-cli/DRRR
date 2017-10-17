/**
 * 历史聊天记录DTO
 */
export interface ChatHistoryDto {
  /**
   * 用户ID
   */
  userId: string;

  /**
   * 用户名
   */
  username: string;

  /**
   * 消息
   */
  message: string;

  /**
   * 时间戳
   */
  timestamp: number;
}
