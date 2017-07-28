import { Injectable } from '@angular/core';

@Injectable()
export class AuthTokenService {

  constructor() { }

  /**
   * 将Token保存到客户端
   * @param {string} token
   */
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }
}
