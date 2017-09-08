import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  private isValidatingAsync: boolean;

  private isWaitingToRegister: boolean;

  private payload: Payload;

  constructor(
    private auth: AuthService,
    private profileService: UserProfileService,
    private fb: FormBuilder,
    private msg: SystemMessagesService
  ) { }

  ngOnInit() {
    this.payload = this.auth.getPayloadFromToken('access_token');

    this.profileForm = this.fb.group({});

    this.formErrorMessages = {};
    // 为避免获取消息时配置文件尚未加载，在外面多包一层函数

    this.requiredValidationMessages = {
      username: () => this.msg.getMessage('E001', '用户名'),
      password: () => this.msg.getMessage('E001', '密码')
    };

    this.profileService.getRegistrationTime()
      .subscribe(time => this.registrationTime = time);
  }
}
