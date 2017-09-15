import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { AccessTokenResponseDto } from '../dtos/access-token-response.dto';

@Injectable()
export class UserRegisterService {

  constructor(private http: HttpClient) {
  }

  /**
   * 验证用户名
   * @param {string} username 用户名
   * @returns {Observable<{error: string}>} 验证结果
   */
  validateUsername(username: string): Observable<{error: string}> {
    return this.http
      .get<{error: string}>(`/api/user/username-validation?username=${username.trim()}`);
  }

  /**
   * 注册
   * @param {Object} registerInfo 注册信息
   * @returns {Observable<AccessTokenResponseDto>} 注册结果
   */
  register(registerInfo: object): Observable<AccessTokenResponseDto> {
    return this.http
      .post<AccessTokenResponseDto>('/api/user/a', registerInfo);
  }
}
