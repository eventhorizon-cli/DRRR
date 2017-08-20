export interface ChatRoomDto {
  id?: string;
  name?: string;
  ownerName?: string;
  maxUsers?: string;
  currentUsers?: string;
  isEncrypted?: boolean;
  isPermanent?: boolean;
  isHidden?: boolean;
}
