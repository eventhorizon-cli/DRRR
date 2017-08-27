import { Role } from './role.enum';

export interface Payload {
  unique_name: string,
  uid: string,
  role: Role,
  nbf: number,
  exp: number,
  iat: number,
  iss: string,
  aud: string
}
