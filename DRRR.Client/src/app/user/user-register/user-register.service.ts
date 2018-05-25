import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';

import { AccessTokenResponseDto } from '../dtos/access-token-response.dto';
import { CaptchaDto } from '../dtos/captcha.dto';

@Injectable()
export class UserRegisterService {

  private connection: HubConnection;

  constructor(private http: HttpClient) {
  }

  /**
   * 验证用户名
   * @param {string} username 用户名
   * @returns {Observable<{error: string}>} 验证结果
   */
  validateUsername(username: string): Observable<{error: string}> {
    return this.http
      .get<{error: string}>(`/api/user/username-validation?username=${encodeURIComponent(username.trim())}`);
  }

  /**
   * 注册
   * @param {Object} registerInfo 注册信息
   * @returns {Observable<AccessTokenResponseDto>} 注册结果
   */
  register(registerInfo: object): Observable<AccessTokenResponseDto> {
    return this.http
      .post<AccessTokenResponseDto>('/api/user/register', registerInfo);
  }

  /**
   * 刷新验证码
   * @return {Promise<CaptchaDto>}
   */
  async refreshCaptcha(): Promise<CaptchaDto> {
    try {
      if (!this.connection) {
        this.connection = new HubConnectionBuilder().withUrl('/captcha').build();
        await this.connection.start();
        this.connection.onclose(() => this.connection = null);
      }
      return this.connection.invoke('GetCaptchaAsync');
    } catch (e) {
      if (!this.connection) {
        return Promise.reject('left');
      }
      this.connection = null;
      return Promise.reject('');
    }
  }

  /**
   * 关闭WebSocket连接
   */
  disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}
