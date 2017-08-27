using DRRR.Server.Dtos;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HashidsNet;
using DRRR.Server.Security;
using System.Text.RegularExpressions;

namespace DRRR.Server.Services
{
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
        /// <returns>房间列表</returns>
        public async Task<ChatRoomSearchResponseDto> GetRoomList(string keyword, int page)
        {
            int count = await _dbContext.ChatRoom
                .CountAsync(room => string.IsNullOrEmpty(keyword)
                            || room.Name.Contains(keyword));

            int totalPages = (int)Math.Ceiling(((decimal)count / 10));
            page = Math.Min(page, totalPages);

            ChatRoomSearchResponseDto chatRoomListDto = new ChatRoomSearchResponseDto();

            // 小于0的判断是为了防止不正当数据
            if (page <= 0)
            {
                return chatRoomListDto;
            }

            chatRoomListDto.ChatRoomList = _dbContext.ChatRoom
                .Where(room => string.IsNullOrEmpty(keyword) || room.Name.Contains(keyword))
                .OrderByDescending(room => room.CreateTime)
                .Skip((page - 1) * 10)
                .Take(10)
                .Select(room => new ChatRoomDto
                {
                    Id = HashidHelper.Encode(room.Id),
                    Name = room.Name,
                    MaxUsers = room.MaxUsers,
                    CurrentUsers = room.CurrentUsers,
                    OwnerName = room.Owner.Username,
                    CreateTime = new DateTimeOffset(room.CreateTime).ToUnixTimeMilliseconds()
                }).ToList();

            chatRoomListDto.Pagination = new PaginationDto
            {
                CurrentPage = page,
                TotalPages = totalPages,
                TotalItems = count
            };

            return chatRoomListDto;
        }


        public async Task<string> CreateRoomAsync(int userId, ChatRoomDto roomDto)
        {
            try
            {
                var room = new ChatRoom
                {
                    OwnerId = userId,
                    Name = roomDto.Name,
                    MaxUsers = roomDto.MaxUsers,
                    IsEncrypted = roomDto.IsEncrypted,
                    IsPermanent = roomDto.IsPermanent,
                    IsHidden = roomDto.IsHidden
                };

                // 如果房间被加密
                Guid salt = Guid.NewGuid();
                if (roomDto.IsEncrypted)
                {
                    // 因为这里的salt字段是可选的，所以不能定义为Guid类型，否则会出问题
                    room.Salt = salt.ToString();
                    room.PasswordHash = PasswordHelper.GeneratePasswordHash(roomDto.Password, salt);
                }

                _dbContext.ChatRoom.Add(room);
                await _dbContext.SaveChangesAsync();
                return null;
            }
            catch
            {
                return _systemMessagesService.GetServerSystemMessage("E004", "房间创建");
            }
        }

        /// <summary>
        /// 验证房间名
        /// </summary>
        /// <param name="name">房间名</param>
        /// <returns>验证结果</returns>
        public async Task<string> ValidateRoomNameAsync(string name = "")
        {
            // 房间名仅支持中日英文、数字和下划线,且不能为纯数字
            if (!Regex.IsMatch(name, @"^[\u4e00-\u9fa5\u3040-\u309F\u30A0-\u30FFa-zA-Z_\d]+$")
            || Regex.IsMatch(name, @"^\d+$"))
            {
                return _systemMessagesService.GetServerSystemMessage("E002", "房间名");
            }

            // 检测用户名是否存在
            int count = await _dbContext.ChatRoom.CountAsync(room => room.Name == name);

            if (count > 0)
            {
                return _systemMessagesService.GetServerSystemMessage("E003", "房间名");
            }
            return null;
        }
    }
}
