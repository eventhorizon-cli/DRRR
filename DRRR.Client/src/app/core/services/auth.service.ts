import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import swal from 'sweetalert2';

import { Payload } from '../models/payload.model';

@Injectable()
export class AuthService {

  /**
   * 需要权限验证的Http请求
   */
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = new Proxy(http, {
      get: (target: HttpClient, propKey: string) => {
        const prop: Function = target[propKey];
        return (...args: any[]): Observable<any> => {
          // 对传入的参数进行编辑
          const getArgs = (): any[] => {
            const headers = this.getAuthorizationHeader('access_token');

            // 如果最后一个参数即options被传入，则进行合并
            if (prop.length === args.length) {
              args[args.length - 1] = {headers, ...args[args.length - 1]}
            } else {
              args.push({headers});
            }
            return args;
          };

          const payload = this.getPayloadFromToken();

          // 如果过期，则刷新访问令牌
          if ((payload.exp - Math.floor(Date.now() / 1000)) < 600) {
            return Observable.create((observer: Observer<object>) => {
              target.post('api/user/refresh-token',
                null,
                {headers: this.getAuthorizationHeader('refresh_token')})
                .subscribe(res => {
                  this.saveAccessToken(res['accessToken']);

                  prop.apply(target, getArgs())
                    .subscribe(data => observer.next(data));
                },  (err: HttpErrorResponse) => {
                  if (err.error instanceof Error) {
                    // 如果是客户端异常
                    console.log('An error occurred:', err.error.message);
                  } else {
                    // 如果请求发生异常
                    console.log(`Backend returned code ${err.status}, body was: ${err.error}`);

                    if (err.status === 401) {
                      // 如果token失效，则回到登录界面
                      swal('登录信息已过期', '回到登录页面', 'error');
                    }
                  }
                });
            })
          }

          return prop.apply(target, getArgs());
        };
      }
    });
  }

  /**
   * 将访问令牌保存到客户端
   * @param {string} accessToken
   */
  saveAccessToken(accessToken: string) {
    localStorage.setItem('access_token', accessToken);
  }

  /**
   * 将更新令牌保存到客户端
   * @param {string} refreshToken
   */
  saveRefreshToken(refreshToken: string) {
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * 从Token中获取信息
   * @returns {Payload} Token信息
   */
  getPayloadFromToken(): Payload {
    let payload: Payload;
    const token = localStorage.getItem('access_token');
    if (token) {
      payload = JSON.parse(atob(token.split('.')[1])) as Payload;
      // 用atob解码含中文的信息会导致异常，所以在后台对用户名进行了url编码
      payload.unique_name = decodeURI(payload.unique_name);
    }
    return payload;
  }


  /**
   * 获得带有权限验证的请求头
   * @param {string} tokenName 令牌名称
   * @returns {HttpHeaders} 带有权限验证的请求头
   */
  private getAuthorizationHeader(tokenName: string): HttpHeaders {
    return new HttpHeaders()
      .set('Authorization', `Bearer ${localStorage.getItem(tokenName)}`);
  }
}
