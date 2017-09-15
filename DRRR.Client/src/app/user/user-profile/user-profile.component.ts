import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import swal from 'sweetalert2';
import * as Cropper from 'cropperjs';

import { AuthService } from '../../core/services/auth.service';
import { UserProfileService } from './user-profile.service';
import { Payload } from '../../core/models/payload.model';
import { SystemMessagesService } from '../../core/services/system-messages.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  registrationTime: string;

  formErrorMessages: object;

  requiredValidationMessages: { [key: string]: Function };

  profileForm: FormGroup;

  avatarURL: string;

  payload: Payload;

  private isValidatingAsync: boolean;

  private isWaitingToRegister: boolean;

  constructor(
    private auth: AuthService,
    private profileService: UserProfileService,
    private fb: FormBuilder,
    private msg: SystemMessagesService
  ) { }

  ngOnInit() {
    this.payload = this.auth.getPayloadFromToken('access_token');

    this.avatarURL = `/api/resources/avatars/${this.payload.uid}`;

    this.profileForm = this.fb.group({});

    this.formErrorMessages = {};
    // 为避免获取消息时配置文件尚未加载，在外面多包一层函数

    this.requiredValidationMessages = {
      username: () => this.msg.getMessage('E001', '用户名'),
      password: () => this.msg.getMessage('E001', '密码')
    };

    // 获取注册时间
    this.profileService.getRegistrationTime()
      .subscribe(time => this.registrationTime = time);
  }

  /**
   * 更新头像
   * @param {HTMLInputElement} file input的dom对象
   */
  updateAvatar(file: HTMLInputElement) {
    let cropper: Cropper;

    let dataURL: string;

    const url = URL.createObjectURL(file.files[0]);
    // 清空value值,避免两次选中同样的文件时不触发change事件
    file.value = '';

    // 设置图像显示区域的最大高度和最大宽度
    const length = screen.availHeight / 2;
    swal({
      title: '裁剪头像',
      html: `
        <div class="img-container">
          <img src="${url}" style="max-height: ${length}px;max-width: ${length}px">
        </div>`,
      showCloseButton: true,
      showLoaderOnConfirm: true,
      confirmButtonText:
      '设置新头像',
      onOpen() {
        const image = <HTMLImageElement>document.querySelector('.img-container img');
        cropper = new Cropper(image, {
          aspectRatio: 1 / 1,
          viewMode: 3,
          dragMode: 'move'
        });
      },
      preConfirm: () => {
        // 确定设置新头像
        return new Promise((resolve, reject) => {
          // 图片最大边长为512
          const croppedLength = Math.min(cropper.getCropBoxData().width, 512);
          dataURL = cropper
            .getCroppedCanvas({ height: croppedLength, width: croppedLength })
            .toDataURL('image/jpeg', 1);
          this.profileService
            .updateAvatar(dataURL)
            .subscribe(resolve,
            _ => { reject(this.msg.getMessage('E004', '更新头像')) });
        });
      },
    }).then(_ => {
      swal({
        type: 'success',
        title: this.msg.getMessage('I001', '更新头像'),
      }).then(() => {
        // 更新本地头像显示
        this.avatarURL = dataURL;
      });
      // 释放资源
      URL.revokeObjectURL(url);
    }, _ => {
      // 释放资源
      URL.revokeObjectURL(url);
    });
  }

  resetPassword(data) {

  }
}
