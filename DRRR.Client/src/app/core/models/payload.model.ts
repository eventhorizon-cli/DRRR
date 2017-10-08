import { Roles } from './roles.enum';

export interface Payload {
  unique_name: string,
  uid: string,
  role: Roles,
  nbf: number,
  exp: number,
  iat: number,
  iss: string,
  aud: string
}
