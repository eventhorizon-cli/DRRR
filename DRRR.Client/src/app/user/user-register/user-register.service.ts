import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AccessTokenDtoDto } from '../dtos/access-token.dto';

@Injectable()
export class UserRegisterService {

  constructor(
    private http: Http) { }

  /**
   * 验证用户名是否合法
   */
  validateUsername(username: string): Observable <string> {
    return this.http
      .get(`/api/user/username-validation/${encodeURIComponent(username.trim())}`)
      .map(res => res.json());
  }

  register(registerInfo: object): Observable <AccessTokenDtoDto> {
    return this.http
      .post('/api/user/register', registerInfo)
      .map(res => res.json());
  }
}
