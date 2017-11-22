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
   * 消息数据（文本或者图片）
   */
  data: string;

  /**
   * 时间戳
   */
  timestamp: number;

  /**
   * 是否为图片
   */
  isPicture: boolean;
}
