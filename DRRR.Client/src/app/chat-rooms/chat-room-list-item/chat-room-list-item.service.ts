import { Injectable } from '@angular/core';

import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';

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
      this.auth.refreshTokenIfNeeded().then(() => {
        const connection = new HubConnectionBuilder().withUrl(`/chat?authorization=${this.auth.accessToken}`).build();

        // 打开连接
        connection.start().then(() => {
          connection.invoke('deleteRoomAsync', roomId)
            .then(() => {
              connection.stop();
              resolve();
            });
        });
      }, () => {});
    });
  }
}
