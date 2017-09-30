import { Injectable } from '@angular/core';

import { HubConnection } from '@aspnet/signalr-client';

import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class ChatRoomService {

  private connection: HubConnection;

  constructor(
    private auth: AuthService
  ) {
  }

  /**
   * 连接房间
   * @param {string} roomId 房间ID
   */
  connect(roomId: string) {
    this.connection = new HubConnection(`/chat?authorization=${this.auth.accessToken}`);

    // 创建回调函数
    this.connection.on('broadcastMessage', (name, message) => {
      console.log(name);
      console.log(message);
    });

    // Start the connection.
    this.connection.start().then(() => {
      this.connection.invoke('send', 'name', 'value');
    });
  }
}
