export interface ChatRoomDto {
  id?: string;
  name?: string;
  ownerName?: string;
  maxUsers?: string;
  currentUsers?: string;
  isEncrypted?: boolean;
  password?: string;
  isPermanent?: boolean;
  isHidden?: boolean;
  createTime?: number;
}
