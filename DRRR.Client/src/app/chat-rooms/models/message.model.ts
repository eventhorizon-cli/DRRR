export interface Message {
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
   * 消息文本
   */
  text: string;
}
