import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

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
}
