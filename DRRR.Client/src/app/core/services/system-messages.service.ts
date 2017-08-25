import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
   * @param {string} msgId 信息代号
   * @param {string[]} args 替换占位符用的参数
   * @returns {string} 特定的系统消息
   */
  getMessage(msgId: string, ...args: string[]): string {
    return ((this.messages || {})[msgId] || '').replace(/{(\d)}/g, (_ , i) => args[i]);
  }
}

