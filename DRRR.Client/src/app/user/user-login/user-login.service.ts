import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { AccessTokenResponseDto } from '../dtos/access-token-response.dto';
import { UserLoginRequestDto } from '../dtos/user-login-request.dto';

@Injectable()
export class UserLoginService {

  constructor(private http: HttpClient) {
  }

  /**
   * 验证登录
   * @param {UserLoginRequestDto} loginInfo 验证登录用的用户信息
   * @returns {Observable<AccessTokenResponseDto>} 验证结果
   */
  login(loginInfo: UserLoginRequestDto): Observable<AccessTokenResponseDto>{
    // 不要手动序列化json数据，否则会导致413错误
    return this.http
      .post<AccessTokenResponseDto>('/api/user/login', loginInfo);
  }
}
