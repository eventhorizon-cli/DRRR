using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using DRRR.Server.Security;
using DRRR.Server.Services;
using System.Web;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DRRR.Server.Dtos;
using System.Collections.Generic;

namespace DRRR.Server.Hubs
{
    [JwtAuthorize(Roles.Guest, Roles.User, Roles.Admin)]
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
        public async Task SendMessage(string roomHashid, string message)
        {
            var userHashId = Context.User.FindFirst("uid").Value;
            var username = HttpUtility.UrlDecode(Context.User.Identity.Name);
            await Clients.Group(roomHashid)
                .InvokeAsync("broadcastMessage", userHashId, username, message)
                .ConfigureAwait(false);
            // 将消息保存到数据库
            var history = new ChatHistory
            {
                RoomId = HashidsHelper.Decode(roomHashid),
                UserId = HashidsHelper.Decode(userHashId),
                UnixTimeMilliseconds = new DateTimeOffset(DateTime.Now).ToUnixTimeMilliseconds(),
                Username = username,
                Message = message
            };
            _dbContext.ChatHistory.Add(history);
            await _dbContext.SaveChangesAsync();
        }

        /// <summary>
        /// 加入房间
        /// </summary>
        /// <param name="roomHashid">房间哈希ID</param>
        /// <returns>表示加入房间的任务，返回房间名和加入该房间的时间</returns>
        public async Task<Object> JoinRoomAsync(string roomHashid)
        {
            var roomId = HashidsHelper.Decode(roomHashid);
            var userId = HashidsHelper.Decode(Context.User.FindFirst("uid").Value);

            var connection = await _dbContext.Connection
                .Where(x => x.RoomId == roomId && x.UserId == userId).FirstOrDefaultAsync()
                .ConfigureAwait(false);

            var roomName = await _dbContext.ChatRoom
                .Where(room => room.Id == roomId)
                .Select(room => room.Name)
                .FirstOrDefaultAsync().ConfigureAwait(false);

            string msgId = null;

            if (connection == null)
            {
                // 第一次进入该房间
                msgId = "I001";
                _dbContext.Add(new Connection
                {
                    RoomId = roomId,
                    UserId = userId,
                    ConnectionId = Context.ConnectionId
                });
            }
            else
            {
                // 重连的情况下
                msgId = "I003";
                connection.ConnectionId = Context.ConnectionId;
                // 虽然允许用户打开多个窗口，但只保留一条记录
                _dbContext.Update(connection);
            }

            await _dbContext.SaveChangesAsync();

            await Groups.AddAsync(Context.ConnectionId, roomHashid);
            // 只加载加入房间前的消息，避免消息重复显示
            long unixTimeMilliseconds = new DateTimeOffset(DateTime.Now).ToUnixTimeMilliseconds();

            // 显示欢迎用户加入房间的消息
            await Clients.Group(roomHashid).InvokeAsync(
                "broadcastSystemMessage",
                _systemMessagesService.GetServerSystemMessage(msgId,
                HttpUtility.UrlDecode(Context.User.Identity.Name)));

            return new
            {
                RoomName = roomName,
                EntryTime = unixTimeMilliseconds
            };
        }

        /// <summary>
        /// 离开房间
        /// </summary>
        /// <param name="roomHashid">房间哈希ID</param>
        /// <returns>表示离开房间的任务</returns>
        public async Task LeaveRoomAsync(string roomHashid)
        {
            var roomId = HashidsHelper.Decode(roomHashid);
            int userId = HashidsHelper.Decode(Context.User.FindFirst("uid").Value);

            await Groups.RemoveAsync(Context.ConnectionId, roomHashid);
            // 通知同一房间里其他人该用户已经离开房间
            await Clients.Group(roomHashid).InvokeAsync(
               "broadcastSystemMessage",
               _systemMessagesService.GetServerSystemMessage("I004",
               HttpUtility.UrlDecode(Context.User.Identity.Name)));

            var room = await _dbContext.ChatRoom.Where(x => x.Id == roomId)
                .FirstOrDefaultAsync().ConfigureAwait(false);

            // 如果不是永久房，则房主离开，就意味着房间要被解散
            if (room?.OwnerId == userId && !room.IsPermanent.Value)
            {
                await DeleteRoomAsync(roomHashid);
            }
        }

        /// <summary>
        /// 失去连接
        /// </summary>
        /// <param name="exception">异常信息</param>
        /// <returns>表示处理失去连接的任务</returns>
        public async override Task OnDisconnectedAsync(Exception exception)
        {
            var roomId = await _dbContext.Connection
                 .Where(conn => conn.ConnectionId == Context.ConnectionId)
                 .Select(conn => conn.RoomId)
                 .FirstOrDefaultAsync();

            // 如果该房间已经被删除，这里得到的id为0
            if (roomId != 0)
            {
                // // 通知同一房间里其他人该用户已经离线的ID
                string msgId = "I002";
                Roles userRole = (Roles)Convert.ToInt32(Context.User.FindFirst(ClaimTypes.Role).Value);
                // 如果是游客，直接删除链接信息
                if (userRole == Roles.Guest)
                {
                    // 游客直接通知离开房间
                    msgId = "I004";
                    var connenction = await _dbContext
                        .Connection.Where(conn => conn.ConnectionId == Context.ConnectionId)
                        .FirstOrDefaultAsync().ConfigureAwait(false);
                    _dbContext.Connection.Remove(connenction);
                    await _dbContext.SaveChangesAsync();
                }

                // 通知同一房间里其他人该用户已经离线
                await Clients.Group(HashidsHelper.Encode(roomId)).InvokeAsync(
                   "broadcastSystemMessage",
                   _systemMessagesService.GetServerSystemMessage(msgId,
                   HttpUtility.UrlDecode(Context.User.Identity.Name)));
            }
            await base.OnDisconnectedAsync(exception);

        }

        /// <summary>
        /// 删除房间
        /// </summary>
        /// <param name="roomHashid">房间哈希ID</param>
        /// <returns>表示删除房间的任务</returns>
        [JwtAuthorize(Roles.User, Roles.Admin)]
        public async Task DeleteRoomAsync(string roomHashid)
        {
            var roomId = HashidsHelper.Decode(roomHashid);
            Roles userRole = (Roles)Convert.ToInt32(Context.User.FindFirst(ClaimTypes.Role).Value);
            int userId = HashidsHelper.Decode(Context.User.FindFirst("uid").Value);

            var room = await _dbContext.ChatRoom.FindAsync(roomId).ConfigureAwait(false);

            // 为了安全做一次判断
            // 如果不是房主或者管理员则无权进行删除处理
            if (userId != room.OwnerId && userRole != Roles.Admin)
            {
                return;
            }

            // 删除房间
            _dbContext.ChatRoom.Remove(room);
            // MySQL触发器负责删除所有连接信息和消息记录
            await _dbContext.SaveChangesAsync();

            await Clients.Group(roomHashid).InvokeAsync("onRoomDeleted",
                _systemMessagesService.GetServerSystemMessage("E008"));
        }

        /// <summary>
        /// 获取历史聊天记录
        /// </summary>
        /// <param name="roomHashid">房间哈希ID</param>
        /// <param name="entryTime">进入房间的时间</param>
        /// <param name="startIndex">此次获取的聊天历史记录的开始序号</param>
        /// <returns>表示获取聊天记录的任务</returns>
        public async Task<List<ChatHistoryDto>> GetChatHistoryAsync(string roomHashid, long entryTime, int startIndex)
        {
            var roomId = HashidsHelper.Decode(roomHashid);
            var history = await _dbContext.ChatHistory
                 .Where(msg => msg.RoomId == roomId
                 && msg.UnixTimeMilliseconds < entryTime)
                 .OrderByDescending(msg => msg.UnixTimeMilliseconds)
                 .Select(msg => new ChatHistoryDto
                 {
                     UserId = HashidsHelper.Encode(msg.UserId),
                     Username = msg.Username,
                     Message = msg.Message,
                     Timestamp = msg.UnixTimeMilliseconds
                 })
                 .Skip(startIndex)
                 .Take(50).ToListAsync();

            return history;
        }
    }
}
