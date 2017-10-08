import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import swal from 'sweetalert2';
import * as Cropper from 'cropperjs';

import { AuthService } from '../../core/services/auth.service';
import { UserProfileService } from './user-profile.service';
import { Payload } from '../../core/models/payload.model';
import { SystemMessagesService } from '../../core/services/system-messages.service';
import { FormErrorsAutoClearer } from '../../core/services/form-errors-auto-clearer.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {

  registrationTime: Observable<string>;

  formErrorMessages: object;

  profileForm: FormGroup;

  avatarURL: string;

  payload: Payload;

  private requiredValidationMessages: { [key: string]: Function };

  private controlsValueChanges: Subscription[];

  constructor(
    private auth: AuthService,
    private profileService: UserProfileService,
    private fb: FormBuilder,
    private msg: SystemMessagesService,
    private autoClearer: FormErrorsAutoClearer
) { }

  ngOnInit() {
    this.profileForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(128)]],
      confirmNewPassword: ['', Validators.required]
    });

    this.formErrorMessages = {};

    this.payload = this.auth.getPayloadFromToken('access_token');

    this.avatarURL = `/api/resources/avatars/originals/${this.payload.uid}`;

    this.controlsValueChanges = this.autoClearer.register(this.profileForm, this.formErrorMessages);

    // 为避免获取消息时配置文件尚未加载，在外面多包一层函数
    this.requiredValidationMessages = {
      newPassword: () => this.msg.getMessage ('E001', '新密码'),
      confirmNewPassword: () => this.msg.getMessage('E001', '确认新密码')
    };

    // 获取注册时间
    this.registrationTime = this.profileService.getRegistrationTime()
  }

  ngOnDestroy () {
    this.controlsValueChanges.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * 更新头像
   * @param {HTMLInputElement} file input的dom对象
   */
  updateAvatar(file: HTMLInputElement) {
    let cropper: Cropper;

    // 裁剪后的原图
    let dataURLOriginal: string;
    // 裁剪后的缩略图
    let dataURLThumbnail: string;

    const url = URL.createObjectURL(file.files[0]);
    // 清空value值,避免两次选中同样的文件时不触发change事件
    file.value = '';

    // 设置图像显示区域的最大高度和最大宽度
    // 当前设备屏幕的一半
    const length = screen.availHeight / 2;
    swal({
      title: '裁剪头像',
      html: `
        <div class="img-container">
          <img src="${url}" style="max-height: ${length}px;max-width: ${length}px">
        </div>`,
      showCloseButton: true,
      showLoaderOnConfirm: true,
      confirmButtonText: '设置新头像',
      allowOutsideClick: false,
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
          const thumbnailLength = Math.min(cropper.getCropBoxData().width, 150);
          dataURLOriginal = cropper
            .getCroppedCanvas({ height: croppedLength, width: croppedLength })
            .toDataURL('image/jpeg', 1);
          dataURLThumbnail = cropper
            .getCroppedCanvas({ height: thumbnailLength, width: thumbnailLength })
            .toDataURL('image/jpeg', 0.9);
          this.profileService
            .updateAvatar(this.payload.uid, dataURLOriginal, dataURLThumbnail)
            .subscribe(success => success ? resolve() :
              reject(this.msg.getMessage('E004', '头像更新')),
              error => reject(this.msg.getMessage('E004', '头像更新')));
        });
      },
    }).then(_ => {
      swal({
        type: 'success',
        title: this.msg.getMessage('I001', '头像更新'),
      }).then(() => {
        // 更新本地头像显示
        this.avatarURL = dataURLOriginal;
      }, () => {});
      // 释放资源
      URL.revokeObjectURL(url);
    }, _ => {
      // 取消按钮被按下
      // 释放资源
      URL.revokeObjectURL(url);
    });
  }

  /**
   * 验证新密码输入是否合法
   * @param {AbstractControl} newPassword 密码
   */
  validateNewPassword(newPassword: AbstractControl) {
    if (newPassword.value.trim()) {
      this.formErrorMessages['newPassword'] = newPassword.valid ? '' :
        this.msg.getMessage('E002', '6', '128', '密码');
    }
  }

  updatePassword(data: object) {
    // 检查必须输入的字段
    Object.entries(data).forEach(entry => {
      if (!entry[1].trim()) {
        this.formErrorMessages[entry[0]] = this.requiredValidationMessages[entry[0]]();
      }
    });

    // 确认密码被输入时才验证确认密码
    if (data['confirmNewPassword'] && data['newPassword'] !== data['confirmNewPassword']) {
      this.formErrorMessages['confirmNewPassword'] = this.msg.getMessage('E003', '新密码');
      return;
    }

    if (Object.entries(this.formErrorMessages).every(entry => !entry[1].trim())) {
      this.msg.showLoadingMessage('I005', '提交请求');
      this.profileService.updatePassword(data)
        .subscribe(res => {
          this.msg.showAutoCloseMessage('success', 'I001', '密码更新');
          this.auth.saveRefreshToken(res.refreshToken);
          this.auth.saveAccessToken(res.accessToken)
        },  error =>
          swal(this.msg.getMessage('E004', '密码更新'),
            this.msg.getMessage('E010'), 'error')
            .then(() => {}, () => {}));
    }
  }
}
