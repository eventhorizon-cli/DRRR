import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AccessTokenDto } from '../dtos/access-token.dto';

@Injectable()
export class UserLoginService {

  constructor(
    private http: HttpClient
  ) { }

  login(loginInfo: object): Observable <AccessTokenDto> {
     // 不要手动序列化json数据，否则会导致413错误
     return this.http
       .post('/api/user/login', loginInfo);
  }
}
