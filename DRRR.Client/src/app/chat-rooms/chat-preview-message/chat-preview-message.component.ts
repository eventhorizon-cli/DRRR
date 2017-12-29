import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { FromEventObservable } from 'rxjs/observable/FromEventObservable';

import { Message } from '../models/message.model';

@Component({
  selector: 'app-chat-preview-message',
  templateUrl: './chat-preview-message.component.html',
  styleUrls: ['./chat-preview-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPreviewMessageComponent implements OnInit, OnDestroy {

  @Input() message: Message;

  private resizeSubscription: Subscription;

  constructor() { }

  ngOnInit() {
    this.setWidth();
    // 重新设置窗口大小后
    this.resizeSubscription = FromEventObservable.create(window, 'resize')
      .subscribe(() => {
        this.setWidth();
      });
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

  scrollToBottom() {
    setTimeout(() => {
      const scrollPanel = $('.msg-container-base');
      scrollPanel.animate({ scrollTop: scrollPanel[0].scrollHeight, speed: 'fast' });
    });
  }

  private setWidth() {
    const scrollPanel = $('.msg-container-base');
    const paddingLeft = +scrollPanel.css('padding-left').replace('px', '');
    $('.preview-message').width(scrollPanel.width() + paddingLeft * 2);
    $('.preview-message p').width(scrollPanel.width());
  }
}
