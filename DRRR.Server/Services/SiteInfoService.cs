using DRRR.Server.Dtos;
using DRRR.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Services
{
    /// <summary>
    /// 提供网站信息的服务
    /// </summary>
    public class SiteInfoService
    {
        private DrrrDbContext _dbContext;

        public SiteInfoService(DrrrDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// 获取网站状态
        /// </summary>
        /// <returns>表示获取网站状态的任务</returns>
        public async Task<SiteStatusDto> GetSiteStatusAsync()
        {
            var currentRooms = await _dbContext.ChatRoom.CountAsync();

            var registeredUsers = await _dbContext.User.CountAsync();

            var onlineRegisteredUsers = await _dbContext.Connection
                .Where(conn => !conn.IsGuest.Value).CountAsync();

            var onlineGuests = await _dbContext.Connection
                .Where(conn => conn.IsGuest.Value).CountAsync();

            return new SiteStatusDto
            {
                CurrentRooms = currentRooms,
                RegisteredUsers = registeredUsers,
                OnlineRegisteredUsers = onlineRegisteredUsers,
                OnlineGuests = onlineGuests
            };
        }
    }
}
