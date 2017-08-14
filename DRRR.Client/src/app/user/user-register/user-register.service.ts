import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AccessTokenResponseDto } from '../dtos/access-token-response.dto';

@Injectable()
export class UserRegisterService {

  constructor(private http: HttpClient) {
  }

  /**
   * 验证用户名是否合法
   */
  validateUsername(username: string): Observable<string> {
    return this.http
      .get<string>(`/api/user/username-validation?username=${username.trim()}`);
  }

  register(registerInfo: object): Observable<AccessTokenResponseDto> {
    return this.http
      .post<AccessTokenResponseDto>('/api/user/register', registerInfo);
  }
}
