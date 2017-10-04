using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using DRRR.Server.Security;
using DRRR.Server.Services;
using System.Web;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace DRRR.Server.Hubs
{
    [JwtAuthorize(Roles.User, Roles.Admin)]
    public class ChatHub : Hub
    {
        private DrrrDbContext _dbContext;

        private SystemMessagesService _systemMessagesService;

        public ChatHub(
            SystemMessagesService systemMessagesService,
            DrrrDbContext dbContext)
        {
            _systemMessagesService = systemMessagesService;
            _dbContext = dbContext;
        }

        /// <summary>
        /// 发送消息
        /// </summary>
        /// <param name="roomHashid">房间哈希ID</param>
        /// <param name="message">消息</param>
        /// <returns></returns>
        public async Task SendMessage(string roomId, string message)
        {
            await Clients.Group(roomId)
                .InvokeAsync("broadcastMessage",
                Context.User.FindFirst("uid").Value,
                HttpUtility.UrlDecode(Context.User.Identity.Name),
                message);
        }

        /// <summary>
        /// 加入房间
        /// </summary>
        /// <param name="roomHashid">房间哈希ID</param>
        /// <returns>表示加入房间的任务</returns>
        public async Task JoinRoomAsync(string roomHashid)
        {
            var roomId = HashidsHelper.Decode(roomHashid);
            var userId = HashidsHelper.Decode(Context.User.FindFirst("uid").Value);

            var connection = await _dbContext.Connection
                .Where(x => x.RoomId == roomId && x.UserId == userId).FirstOrDefaultAsync();

            string msgId = null;

            if (connection == null)
            {
                // 第一次进入该房间
                msgId = "I001";
                _dbContext.Add(new Connection
                {
                    RoomId = roomId,
                    UserId = userId,
                    ConnectionId = new Guid(Context.ConnectionId)
                });
            }
            else
            {
                // 重连的情况下
                msgId = "I003";
                connection.ConnectionId = new Guid(Context.ConnectionId);
                // 虽然允许用户打开多个窗口，但只保留一条记录
                _dbContext.Update(connection);
            }

            await _dbContext.SaveChangesAsync();

            await Groups.AddAsync(Context.ConnectionId, roomHashid);

            // 显示欢迎用户加入房间的消息
            await Clients.Group(roomHashid).InvokeAsync(
                "broadcastSystemMessage",
                _systemMessagesService.GetServerSystemMessage(msgId,
                HttpUtility.UrlDecode(Context.User.Identity.Name)));
        }

        /// <summary>
        /// 离开房间
        /// </summary>
        /// <param name="roomHashid">房间哈希ID</param>
        /// <returns>表示离开房间的任务</returns>
        public async Task LeaveRoomAsync(string roomHashid)
        {
            await Groups.RemoveAsync(Context.ConnectionId, roomHashid);
            // 通知同一房间里其他人该用户已经离开房间
            await Clients.Group(roomHashid).InvokeAsync(
               "broadcastSystemMessage",
               _systemMessagesService.GetServerSystemMessage("I004",
               HttpUtility.UrlDecode(Context.User.Identity.Name)));
        }

        /// <summary>
        /// 失去连接
        /// </summary>
        /// <param name="exception">异常信息</param>
        /// <returns>表示处理失去连接的任务</returns>
        public async override Task OnDisconnectedAsync(Exception exception)
        {
            var roomId = await _dbContext.Connection
                 .Where(conn => conn.ConnectionId.ToString() == Context.ConnectionId)
                 .Select(conn=> conn.RoomId)
                 .FirstOrDefaultAsync();

            // 通知同一房间里其他人该用户已经离线
            await Clients.Group(HashidsHelper.Encode(roomId)).InvokeAsync(
               "broadcastSystemMessage",
               _systemMessagesService.GetServerSystemMessage("I002",
               HttpUtility.UrlDecode(Context.User.Identity.Name)));
            await base.OnDisconnectedAsync(exception);

        }
    }
}
