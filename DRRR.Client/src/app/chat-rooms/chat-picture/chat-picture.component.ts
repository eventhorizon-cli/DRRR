import { Component, ElementRef, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { AuthService } from '../../core/services/auth.service';
import { SystemMessagesService } from '../../core/services/system-messages.service';

@Component({
  selector: 'app-chat-picture',
  templateUrl: './chat-picture.component.html',
  styleUrls: ['./chat-picture.component.css']
})
export class ChatPictureComponent implements OnInit {

  originalSrc: string;

  constructor(
    public bsModalRef: BsModalRef,
    private el: ElementRef,
    private auth: AuthService,
    private msg: SystemMessagesService) { }

  ngOnInit() {
    // 如果加载时间超过0.5秒则显示
    const timeoutId = setTimeout(() => {
      this.msg.showLoadingMessage('I005', '图片加载');
    }, 500);
    this.auth.refreshTokenIfNeeded().then(() => {
      this.originalSrc = `${sessionStorage.getItem('originalSrc')}&authorization=${this.auth.accessToken}`;
      sessionStorage.removeItem('originalSrc');
      // 避免图片过早显示
      const img = this.el.nativeElement.querySelector('img');
      img.addEventListener('load',  () => {
        clearTimeout(timeoutId);
        this.msg.closeLoadingMessage();
        const { naturalWidth, naturalHeight } = img;
        const dialog = $('.picture-modal-dialog');
        // 经过多次试验，通过宽度限制死最合适的
        let width = naturalWidth;
        if (naturalHeight > window.innerHeight)  {
          width = naturalWidth / naturalHeight * (window.innerHeight - 100);
        }
        if (width > window.innerWidth) {
          width = window.innerWidth;
        }
        dialog.width(width);
        dialog.show();
        dialog.css('top', (window.innerHeight - dialog.height()) / 2);
      });
    });
  }
}
