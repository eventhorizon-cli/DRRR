import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

// 可能会导致编译问题或者ie下兼容问题
// 参考资料：https://github.com/aspnet/SignalR/issues/983
// import { HubConnection } from '@aspnet/signalr-client/dist/browser/signalr-clientES5-1.0.0-alpha2-final.js';
import { HubConnection } from '@aspnet/signalr-client';
// import { HubConnection } from '@aspnet/signalr-client/ts/HubConnection';

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
        this.connection = new HubConnection('/captcha');
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
