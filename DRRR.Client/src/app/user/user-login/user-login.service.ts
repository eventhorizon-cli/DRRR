import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { SystemMessagesService } from '../../core/system-messages.service';
import { UserLoginResultDto } from '../dtos/user-login-result.dto';

@Injectable()
export class UserLoginService {

  constructor(
    private http: Http,
    private msgService: SystemMessagesService
  ) { }

  login(data: object): Observable <UserLoginResultDto> {
     // 不要手动序列化json数据，否则会导致413错误
     return this.http
       .post('/api/user/login', data)
       .map(res => res.json());
  }
}
