import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../core/services/auth.service';


@Injectable()
export class UserProfileService {

  constructor(
    private auth: AuthService
  ) { }

  /**
   * 获取用户注册时间
   * @returns {Observable<string>} 注册时间
   */
  getRegistrationTime(): Observable<string> {
    return this.auth.http.get('/api/user/registration-time', { responseType: 'text' });
  }
}
