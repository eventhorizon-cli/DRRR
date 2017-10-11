export interface UserLoginRequestDto {
  username?: string;
  password?: string;
  isGuest?: boolean;
  rememberMe?: boolean;
}
