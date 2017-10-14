import { Injectable } from '@angular/core';

// 可能会导致编译问题
// 参考资料：https://github.com/aspnet/SignalR/issues/983
import { HubConnection } from '@aspnet/signalr-client/dist/browser/signalr-clientES5-1.0.0-alpha2-final.js';
// import { HubConnection } from '@aspnet/signalr-client';

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
      this.auth.refreshTokenWhenNecessary(() => {
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
    });
  }
}
