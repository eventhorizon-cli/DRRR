import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AuthService {

  /**
   * 需要权限验证的Http请求
   */
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = new Proxy(http, {
      get: (target, propKey) => {
        return (...args) => {
          const headers: HttpHeaders = new HttpHeaders();
          headers.set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
          return http[propKey].apply(http, args, { headers });
        }
      }
    })
  }

  /**
   * 将Token保存到客户端
   * @param {string} token
   */
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }
}
