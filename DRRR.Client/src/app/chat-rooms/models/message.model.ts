export interface Message {
  /**
   * 房间ID
   */
  roomId?: string;

  /**
   * 用户ID
   */
  userId?: string;

  /**
   * 用户名
   */
  username?: string;
  /**
   * 是否为接收到的消息
   */

  incoming?: boolean;

  /**
   * 是否是系统通知消息
   */
  isSystemMessage: boolean;

  /**
   * 消息数据（文本或者图片）
   */
  data: string;

  /**
   * 时间戳
   */
  timestamp?: number;

  /**
   * 显示消息时间
   */
  showMessageTime?: boolean;

  /**
   * 是否为聊天记录
   */
  isChatHistory?: boolean;

  /**
   * 是否为图片
   */
  isPicture?: boolean;
}
