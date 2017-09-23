import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import swal from 'sweetalert2';

/**
 * 提供系统消息资源
 */
@Injectable()
export class SystemMessagesService {
  private messages: object;

  constructor(private http: HttpClient) {
    // 先尝试用存在localStorage里数据，以免在页面刚加载就报信息的时候后台没来得及返回
    this.messages = JSON.parse(localStorage.getItem('messages'));

    this.http.get('/api/resources/system-messages')
      .subscribe(data => {
        this.messages = data;
        localStorage.setItem('messages', JSON.stringify(data))
      });
  }

  /**
   * 获取特定的系统消息
   * @param {string} msgId 消息代号
   * @param {string[]} args 替换占位符用的参数
   * @returns {string} 指定的系统消息
   */
  getMessage(msgId: string, ...args: string[]): string {
    return ((this.messages || {})[msgId] || '')
      .replace(/{(\d)}/g, (_ , i) => args[i]);
  }

  /**
   * 显示自动关闭的消息窗口
   * @param {string} msgId 消息代号
   * @param {string} args 替换占位符用的参数
   */
  showAutoCloseMessage(msgId: string, ...args: string[]) {
    swal({
      title: this.getMessage(msgId, ...args),
      type: 'success',
      showConfirmButton: false,
      timer: 2000 // 2秒后自动关闭
    }).then(() => {}, () => {});
  }

  /**
   * 显示加载消息窗口
   * @param {string} msgId 消息代号
   * @param {string} args 替换占位符用的参数
   */
  showLoadingMessage(msgId: string, ...args: string[]) {
    swal({
      title: this.getMessage(msgId, ...args),
      showConfirmButton: false,
      allowOutsideClick: false,
      onOpen: function () {
        swal.showLoading();
      }
    }).then(() => {}, () => {});
  }

  /**
   * 关闭加载消息窗口
   */
  closeLoadingMessage() {
    if (swal.isVisible()) {
      swal.close();
    }
  }
}
