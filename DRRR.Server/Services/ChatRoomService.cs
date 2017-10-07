using DRRR.Server.Dtos;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using DRRR.Server.Security;
using System.Text.RegularExpressions;

namespace DRRR.Server.Services
{
    /// <summary>
    /// 聊天室服务
    /// </summary>
    public class ChatRoomService
    {
        private DrrrDbContext _dbContext;

        private SystemMessagesService _systemMessagesService;

        public ChatRoomService(
            DrrrDbContext dbContext,
            SystemMessagesService systemMessagesService)
        {
            _dbContext = dbContext;
            _systemMessagesService = systemMessagesService;
        }

        /// <summary>
        /// 获取房间列表
        /// </summary>
        /// <param name="keyword">关键词</param>
        /// <param name="page">页码</param>
        /// <returns>表示异步获取房间列表的任务，如果创建失败则返回错误信息</returns>
        public async Task<ChatRoomSearchResponseDto> GetRoomList(string keyword, int page)
        {
            var query = from room in _dbContext.ChatRoom
                        where (((string.IsNullOrEmpty(keyword) ?
                        true : room.Name.Contains(keyword)
                        || room.Owner.Username.Contains(keyword))
                        && !room.IsHidden.Value)
                        ||
                        (room.Name == keyword && room.IsHidden.Value))
                        select room;

            int count = await query.CountAsync().ConfigureAwait(false);

            int totalPages = (int)Math.Ceiling(((decimal)count / 10));
            page = Math.Min(page, totalPages);

            ChatRoomSearchResponseDto chatRoomListDto = new ChatRoomSearchResponseDto();

            // 小于0的判断是为了防止不正当数据
            if (page <= 0)
            {
                return chatRoomListDto;
            }

            chatRoomListDto.ChatRoomList = await query
                .OrderByDescending(room => room.CreateTime)
                .Skip((page - 1) * 10)
                .Take(10)
                .Select(room => new ChatRoomDto
                {
                    Id = HashidsHelper.Encode(room.Id),
                    Name = room.Name,
                    MaxUsers = room.MaxUsers,
                    CurrentUsers = room.CurrentUsers,
                    OwnerName = room.Owner.Username,
                    CreateTime = new DateTimeOffset(room.CreateTime).ToUnixTimeMilliseconds()
                }).ToListAsync().ConfigureAwait(false);

            chatRoomListDto.Pagination = new PaginationDto
            {
                CurrentPage = page,
                TotalPages = totalPages,
                TotalItems = count
            };

            return chatRoomListDto;
        }

        /// <summary>
        /// 创建房间
        /// </summary>
        /// <param name="uid">用户ID</param>
        /// <param name="roomDto">用户输入的用于创建房间的信息</param>
        /// <returns>表示异步创建房间的任务，如果创建失败则返回错误信息</returns>
        public async Task<ChatRoomCreateResponseDto> CreateRoomAsync(int uid, ChatRoomDto roomDto)
        {
            // 因为前台可以按下回车就可以提交表单，所以可能一开始没check住
            var error = await ValidateRoomNameAsync(roomDto.Name);

            if (error != null)
            {
                return new ChatRoomCreateResponseDto
                {
                    Error = error
                };
            }

            try
            {
                var room = new ChatRoom
                {
                    OwnerId = uid,
                    Name = roomDto.Name,
                    MaxUsers = roomDto.MaxUsers,
                    IsEncrypted = roomDto.IsEncrypted,
                    IsPermanent = roomDto.IsPermanent,
                    IsHidden = roomDto.IsHidden
                };

                // 如果房间被加密
                if (roomDto.IsEncrypted)
                {
                    Guid salt = Guid.NewGuid();
                    room.Salt = salt;
                    room.PasswordHash = PasswordHelper.GeneratePasswordHash(roomDto.Password, salt);
                }

                _dbContext.ChatRoom.Add(room);
                await _dbContext.SaveChangesAsync();
                return new ChatRoomCreateResponseDto
                {
                    RoomId = HashidsHelper.Encode(room.Id)
                };
            }
            catch (Exception)
            {
                // 因为是多线程，任然可能发生异常
                // 房间名重复
                return new ChatRoomCreateResponseDto
                {
                    Error = _systemMessagesService.GetServerSystemMessage("E003", "房间名")
                };
            }
        }

        /// <summary>
        /// 验证房间名
        /// </summary>
        /// <param name="name">房间名</param>
        /// <returns>异步获取验证结果的任务</returns>
        public async Task<string> ValidateRoomNameAsync(string name = "")
        {
            // 房间名仅支持中日英文、数字和下划线,且不能为纯数字
            if (!Regex.IsMatch(name, @"^[\u4e00-\u9fa5\u3040-\u309F\u30A0-\u30FFa-zA-Z_\d]+$")
            || Regex.IsMatch(name, @"^\d+$"))
            {
                return _systemMessagesService.GetServerSystemMessage("E002", "房间名");
            }

            // 检测用户名是否存在
            int count = await _dbContext
                .ChatRoom.CountAsync(room => room.Name == name)
                .ConfigureAwait(false);

            if (count > 0)
            {
                return _systemMessagesService.GetServerSystemMessage("E003", "房间名");
            }
            return null;
        }

        /// <summary>
        /// 获取用户上一次登录时所在的房间ID
        /// </summary>
        /// <param name="uid">用户ID</param>
        /// <returns>表示获取用户上一次登录时所在的房间ID的任务</returns>
        public async Task<string> GetPreviousRoomIdAsync(int uid)
        {
            var roomId = await _dbContext.Connection
                      .Where(conn => conn.UserId == uid)
                      .Select(conn => conn.RoomId)
                      .FirstOrDefaultAsync()
                      .ConfigureAwait(false);
            // 房间ID为0则说明没找到
            if (roomId == 0) return null;
            return HashidsHelper.Encode(roomId);
        }

        /// <summary>
        /// 删除连接信息
        /// </summary>
        /// <param name="roomId">房间ID</param>
        /// <param name="userId">用户ID</param>
        /// <returns>表示删除连接的任务</returns>
        public async Task<string> DeleteConnectionAsync(int roomId, int userId)
        {
            var connection = await _dbContext.Connection.FindAsync(roomId, userId);
            if (connection == null) return string.Empty;
            _dbContext.Remove(connection);
            await _dbContext.SaveChangesAsync();
            // 返回空字符串避免前台出错
            return string.Empty;
        }

        /// <summary>
        /// 申请加入房间
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="roomId">房间ID</param>
        /// <param name="userRole">用户角色</param>
        /// <returns></returns>
        public async Task<ChatRoomApplyForEntryResponseDto> ApplyForEntryAsync(int userId, Roles userRole, int roomId)
        {
            var room = await _dbContext.ChatRoom.FindAsync(roomId);
            var res = new ChatRoomApplyForEntryResponseDto();
            if (room == null)
            {
                // 该房间已经不存在
                res.Error = _systemMessagesService.GetServerSystemMessage("E005");
            }
            else if (room.CurrentUsers == room.MaxUsers)
            {
                // 该房间成员数已满
                res.Error = _systemMessagesService.GetServerSystemMessage("E006");
            }
            else if (room.IsEncrypted.Value)
            {
                // 该房间为加密房
                if (userRole != Roles.Admin && room.OwnerId != userId)
                {
                    // 用户不是管理员或者房主
                    var conn = await _dbContext.Connection.FindAsync(roomId, userId);
                    if (conn == null)
                    {
                        // 第一次来这个房间
                        res.PasswordRequired = true;
                    }
                }
            }

            return res;
        }

        /// <summary>
        /// 验证房间密码
        /// </summary>
        /// <param name="roomId">房间ID</param>
        /// <param name="password">密码</param>
        /// <returns>表示验证房间密码的任务</returns>
        public async Task<ChatRoomValidatePasswordResponseDto> ValidatePasswordAsync(int roomId, string password)
        {
            var room = await _dbContext.ChatRoom.FindAsync(roomId);

            var res = new ChatRoomValidatePasswordResponseDto();

            if (room == null)
            {
                // 该房间已经不存在
                res.Error = _systemMessagesService.GetServerSystemMessage("E005");
                res.Refresh = true;
            }
            else if (room.CurrentUsers == room.MaxUsers)
            {
                // 该房间已经不存在
                res.Error = _systemMessagesService.GetServerSystemMessage("E006");
                res.Refresh = true;
            }
            else if (!PasswordHelper.ValidatePassword(password, room.Salt, room.PasswordHash))
            {
                // 密码错误
                res.Error = _systemMessagesService.GetServerSystemMessage("E007", "密码");
            }
            return res;
        }
    }
}
