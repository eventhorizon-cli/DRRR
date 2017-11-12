/**
 * 房间初期显示DTO
 */
export interface ChatRoomInitialDisplayDto {
  /**
   * 房主ID
   */
  ownerId: string;
  /**
   * 房间名
   */
  roomName: string;

  /**
   * 加入房间的时间
   */
  entryTime: number;
}
