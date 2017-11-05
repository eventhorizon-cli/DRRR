/**
 * 房间成员DTO
 */
export interface ChatRoomMemberDto {
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
  /**
   * 是否在线
   */
  isOnline: boolean;
  /**
   * 是否是房主
   */
  isOwner: boolean;
}
