import { Injectable } from '@angular/core';

import { HubConnection } from '@aspnet/signalr-client/dist/src';

import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class ChatRoomListItemService {

  constructor(
    private auth: AuthService
  ) { }

  /**
   * 删除房间
   * @param {string} roomId 房间ID
   * @return Promise对象
   */
  deleteRoom(roomId: string): Promise<never> {
    return new Promise<never>((resolve) => {
      // 需要打开WebSocket通知房间内的人
      const connection = new HubConnection(`/chat?authorization=${this.auth.accessToken}`);

      // 打开连接
      connection.start().then(() => {
        connection.invoke('deleteRoomAsync', roomId)
          .then(() => {
            connection.stop();
            resolve();
          });
      });
    });
  }
}
