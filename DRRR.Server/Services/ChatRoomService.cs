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
            ChatRoomSearchResponseDto chatRoomListDto = new ChatRoomSearchResponseDto();
            int count = await _dbContext.ChatRoom
                .CountAsync(room => string.IsNullOrEmpty(keyword)
                            || room.Name.Contains(keyword));


            int totalPages = (int)Math.Ceiling(((decimal)count / 10));
            page = Math.Min(page, totalPages);

            var data = _dbContext.ChatRoom
                .Where(room => string.IsNullOrEmpty(keyword) || room.Name.Contains(keyword))
                .OrderByDescending(room => room.CreateTime)
                .Skip((page - 1) * 10)
                .Take(10)
                .Select(room => new
                {
                    Room = room,
                    OwnerName = room.Owner.Username
                });

            List<ChatRoomDto> list = new List<ChatRoomDto>();
            foreach (var record in data)
            {
                ChatRoom room = record.Room;
                var hashid = HashidHelper.Encode(room.Id);
                list.Add(new ChatRoomDto
                {
                    Id = hashid,
                    Name = room.Name,
                    OwnerName = record.OwnerName,
                    MaxUsers = room.MaxUsers,
                    CurrentUsers = room.CurrentUsers
                });
            }
            chatRoomListDto.ChatRoomList = list;
            chatRoomListDto.Pagination = new PaginationDto
            {
                CurrentPage = page,
                TotalPages = totalPages
            };

            return chatRoomListDto;
        }


        public async Task<string> CreateRoomAsync(int userId, ChatRoomDto roomDto)
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

            _dbContext.ChatRoom.Add(room);
            await _dbContext.SaveChangesAsync();
            return "";
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
