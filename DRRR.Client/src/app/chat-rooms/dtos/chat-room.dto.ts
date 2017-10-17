/**
 * 聊天室信息DTO
 */
export interface ChatRoomDto {
  /**
   * ID
   */
  id?: string;

  /**
   * 房间名
   */
  name?: string;

  /**
   * 房主名
   */
  ownerName?: string;

  /**
   * 最大用户数
   */
  maxUsers?: string;

  /**
   * 当前用户数
   */
  currentUsers?: string;

  /**
   * 是否为加密房
   */
  isEncrypted?: boolean;

  /**
   * 密码
   */
  password?: string;

  /**
   * 是否为永久房
   */
  isPermanent?: boolean;

  /**
   * 是否为隐藏房
   */
  isHidden?: boolean;

  /**
   * 是否允许游客进入
   */
  allowGuest?: boolean;

  /**
   * 创建时间
   */
  createTime?: number;
}
