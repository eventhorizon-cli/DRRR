import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { AccessTokenResponseDto } from '../dtos/access-token-response.dto';

@Injectable()
export class UserLoginService {

  constructor(private http: HttpClient) {
  }

  login(loginInfo: object): Observable<AccessTokenResponseDto> {
    // 不要手动序列化json数据，否则会导致413错误
    return this.http
      .post<AccessTokenResponseDto>('/api/user/login', loginInfo);
  }
}
