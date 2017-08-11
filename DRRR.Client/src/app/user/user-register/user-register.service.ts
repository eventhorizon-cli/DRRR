import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AccessTokenDto } from '../dtos/access-token.dto';

@Injectable()
export class UserRegisterService {

  constructor(
    private http: HttpClient) { }

  /**
   * 验证用户名是否合法
   */
  validateUsername(username: string): Observable <string> {
    return this.http
      .get(`/api/user/username-validation?username=${username.trim()}`);
  }

  register(registerInfo: object): Observable <AccessTokenDto> {
    return this.http
      .post('/api/user/register', registerInfo);
  }
}
