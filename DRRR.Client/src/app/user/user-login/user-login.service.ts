import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { SystemMessagesService } from '../../core/services/system-messages.service';
import { AccessTokenDtoDto } from '../dtos/access-token.dto';

@Injectable()
export class UserLoginService {

  constructor(
    private http: Http,
    private msgService: SystemMessagesService
  ) { }

  login(loginInfo: object): Observable <AccessTokenDtoDto> {
     // 不要手动序列化json数据，否则会导致413错误
     return this.http
       .post('/api/user/login', loginInfo)
       .map(res => res.json());
  }
}
