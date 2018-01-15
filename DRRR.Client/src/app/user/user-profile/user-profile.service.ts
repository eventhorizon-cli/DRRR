import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../core/services/auth.service';
import { AccessTokenResponseDto } from '../dtos/access-token-response.dto';

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

  /**
   * 更新用户头像
   * @param {string} uid 用户ID
   * @param {string} dataURL dataURL字符串
   * @returns {Observable<{error: string}>}
   */
  updateAvatar(uid: string, dataURL: string): Observable<boolean> {
    const formData = new FormData();
    formData.append('avatar', this.dataURItoBlob(dataURL));
    return this.auth
      .http.put<boolean>(`/api/resources/avatars/${uid}`, formData);
  }

  /**
   * 更改密码
   * @param {Object} data 包含新密码的数据
   * @returns {Observable<AccessTokenResponseDto>} 新的Token
   */
  updatePassword(data: object): Observable<AccessTokenResponseDto> {
    return this.auth.http.post<AccessTokenResponseDto>('/api/user/password', data);
  }

  /**
   * 将dataURL字符串转为blob对象
   * @param {string} dataURL dataURL字符串
   * @returns {Blob} blob对象
   */
  private dataURItoBlob(dataURL: string): Blob {
    // 参考资料 https://stackoverflow.com/questions/6850276/how-to-convert-dataurl-to-file-object-in-javascript

    // 逗号前面的部分是表示文件类型的部分
    const byteString = atob(dataURL.split(',')[1]);

    // 切割出文件类型
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    // 将数据逐字节放入Uint8Array数组中
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // 将Uint8Array数组转为Blob对象
    return new Blob([ab], { type: mimeString });
  }
}
