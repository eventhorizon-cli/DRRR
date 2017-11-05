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
        public async Task<ChatRoomInitialDisplayDto> JoinRoomAsync(string roomHashid)
        {
            var roomId = HashidsHelper.Decode(roomHashid);
            var userId = HashidsHelper.Decode(Context.User.FindFirst("uid").Value);
            var username = HttpUtility.UrlDecode(Context.User.Identity.Name);

            var connection = await _dbContext.Connection
                .Where(x => x.RoomId == roomId && x.UserId == userId).FirstOrDefaultAsync()
                .ConfigureAwait(false);

            string msgId = null;
            string connIdToBeRemoved = null;
            if (connection == null)
            {
                // 第一次进入该房间
                msgId = "I001";
                _dbContext.Add(new Connection
                {
                    RoomId = roomId,
                    UserId = userId,
                    Username = username,
                    ConnectionId = Context.ConnectionId
                });
            }
            else
            {
                // 如果用户同时打开两个窗口
                if (connection.IsOnline.Value)
                {
                    connIdToBeRemoved = connection.ConnectionId;
                }
                // 重连的情况下
                msgId = "I003";
                connection.IsOnline = true;
                connection.ConnectionId = Context.ConnectionId;
                // 只保留一条记录
                _dbContext.Update(connection);
            }

            await _dbContext.SaveChangesAsync();

            // 将用户添加到分组
            await Groups.AddAsync(Context.ConnectionId, roomHashid);

            // 只加载加入房间前的消息，避免消息重复显示
            long unixTimeMilliseconds = new DateTimeOffset(DateTime.Now).ToUnixTimeMilliseconds();

            // 显示欢迎用户加入房间的消息
            await Clients.Group(roomHashid).InvokeAsync(
                "broadcastSystemMessage",
                _systemMessagesService.GetServerSystemMessage(msgId, username));

            // TODO 应该在前一个登陆窗口显示消息，告知账号已经在其他地方登陆
            if (!string.IsNullOrEmpty(connIdToBeRemoved))
            {
                await Groups.RemoveAsync(connIdToBeRemoved, roomHashid);
            }

            // 显示用户列表
            await RefreshMemberListAsync(roomHashid, roomId);

            var room = await _dbContext.ChatRoom
                .Where(r => r.Id == roomId)
                .Select(r => new { r.Name, r.MaxUsers })
                .FirstOrDefaultAsync().ConfigureAwait(false);

            return new ChatRoomInitialDisplayDto
            {
                RoomName = room.Name,
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

            var count = await _dbContext
                .Connection
                .CountAsync(conn => conn.RoomId == roomId
                            && conn.UserId == userId
                            && conn.ConnectionId == Context.ConnectionId)
                .ConfigureAwait(false);

            // 如果用户开了多个窗口的话，这边可能会出问题
            if (count == 0) return;

            // 通知同一房间里其他人该用户已经离开房间
            await Clients.Group(roomHashid).InvokeAsync(
               "broadcastSystemMessage",
               _systemMessagesService.GetServerSystemMessage("I004",
               HttpUtility.UrlDecode(Context.User.Identity.Name)));

            var room = await _dbContext.ChatRoom.Where(x => x.Id == roomId)
                .FirstOrDefaultAsync().ConfigureAwait(false);

            // 如果该房间已经被删除的话
            if (room == null) return;

            // 如果不是永久房，则房主离开，就意味着房间要被解散
            if (room.OwnerId == userId && !room.IsPermanent.Value)
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
            var connenction = await _dbContext
                .Connection.Where(conn => conn.ConnectionId == Context.ConnectionId)
                .FirstOrDefaultAsync().ConfigureAwait(false);

            // 如果用户开了多个窗口的话，这边可能会出问题
            if (connenction == null) return;

            var roomHashid = HashidsHelper.Encode(connenction.RoomId);

            // 检索房主ID
            var ownerId = await _dbContext.ChatRoom
               .Where(r => r.Id == connenction.RoomId)
               .Select(r => r.OwnerId)
               .FirstOrDefaultAsync().ConfigureAwait(false);

            // 如果当前房间已经被删除，ownerId会得到0
            // 或者该连接被标记为删除，即用户退出聊天室
            if (ownerId == 0 || connenction.IsDeleted.Value)
            {
                // 删除连接信息
                _dbContext.Connection.Remove(connenction);
            }
            else
            {
                // 以下为用户失去连接的情况

                // 消息ID
                string msgId;
                Roles userRole = (Roles)Convert.ToInt32(Context.User.FindFirst(ClaimTypes.Role).Value);
                // 如果是游客，直接删除链接信息
                if (userRole == Roles.Guest)
                {
                    // 游客直接通知离开房间
                    msgId = "I004";
                    _dbContext.Connection.Remove(connenction);
                }
                else
                {
                    // 通知同一房间里其他人该用户已经离线的ID
                    msgId = "I002";
                    connenction.IsOnline = false;
                    _dbContext.Update(connenction);
                }
                // 通知同一房间里其他人该用户已经离线或游客离开房间
                await Clients.Group(roomHashid).InvokeAsync(
                    "broadcastSystemMessage",
                    _systemMessagesService.GetServerSystemMessage(msgId,
                    HttpUtility.UrlDecode(Context.User.Identity.Name)));
            }

            await _dbContext.SaveChangesAsync();

            // 刷新用户列表
            await RefreshMemberListAsync(roomHashid, connenction.RoomId);

            // 从分组中删除当前连接
            // 注意 移除必须是在最后做，否则会报错
            await Groups.RemoveAsync(Context.ConnectionId, roomHashid);
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

            var room = await _dbContext.ChatRoom.FindAsync(roomId).ConfigureAwait(false);

            // 当前房间已经被删除则不做处理
            if (room == null) return;

            Roles userRole = (Roles)Convert.ToInt32(
                Context.User.FindFirst(ClaimTypes.Role).Value);
            int userId = HashidsHelper.Decode(Context.User.FindFirst("uid").Value);

            // 为了安全做一次判断
            // 如果不是房主或者管理员则无权进行删除处理
            if (userId != room.OwnerId && userRole != Roles.Admin) return;

            using (var tran = await _dbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    // 删除房间
                    _dbContext.ChatRoom.Remove(room);

                    await _dbContext.SaveChangesAsync();

                    // 删除历史聊天信息
                    await _dbContext.Database.ExecuteSqlCommandAsync(
                        $"delete from chat_history where room_id = {room.Id}");

                    // 删除已经离线的用户的连接信息
                    await _dbContext.Database.ExecuteSqlCommandAsync(
                        $"delete from connection where room_id = {room.Id} and is_online = false");

                    tran.Commit();

                    await Clients.Group(roomHashid).InvokeAsync("onRoomDeleted",
                        _systemMessagesService.GetServerSystemMessage("E008"));
                }
                catch
                {

                    tran.Rollback();
                }
            }
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
                 .Take(20).ToListAsync();

            return history;
        }

        /// <summary>
        /// 刷新房间成员列表信息
        /// </summary>
        /// <param name="roomHashid">房间哈希ID</param>
        /// <param name="roomId">房间ID</param>
        /// <returns>表示刷新房间成员列表信息的任务</returns>
        private async Task RefreshMemberListAsync(string roomHashid, int roomId)
        {
            var ownerId = await _dbContext.ChatRoom
                .Where(room => room.Id == roomId)
                .Select(room => room.OwnerId).FirstOrDefaultAsync();

            var list = await _dbContext.Connection
                .Where(conn => conn.RoomId == roomId)
                .OrderBy(conn => conn.CreateTime)
                .Select(conn => new ChatRoomMemberDto
                {
                    UserId = HashidsHelper.Encode(conn.UserId),
                    Username = conn.Username,
                    IsOnline = conn.IsOnline.Value,
                    IsOwner = conn.UserId == ownerId
                })
                .OrderByDescending(x => x.IsOwner)
                .ThenByDescending(x => x.IsOnline)
                .ToListAsync();

            await Clients.Group(roomHashid).InvokeAsync("refreshMemberList", list);
        }
    }
}
