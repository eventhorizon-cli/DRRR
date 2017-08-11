using DRRR.Server.Dtos;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HashidsNet;

namespace DRRR.Server.Services
{
    public class ChatRoomService
    {
        private DrrrDbContext _dbContext;

        public ChatRoomService(DrrrDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ChatRoomListDto> GetRoomList(string keyword, int page)
        {
            ChatRoomListDto chatRoomListDto = new ChatRoomListDto();
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
                var hashids = new Hashids(room.Salt);
                var id = hashids.Encode(room.Id);
                list.Add(new ChatRoomDto
                {
                    Id = id,
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
    }
}
