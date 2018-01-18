using DRRR.Server.Dtos;
using DRRR.Server.Models;
using DRRR.Server.Security;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Hubs
{
    public class CaptchaHub : Hub
    {
        private readonly DrrrDbContext _dbContext;

        public CaptchaHub(DrrrDbContext dbContext) => _dbContext = dbContext;

        /// <summary>
        /// 异步获取验证码,返回base64转码后的验证码图片和验证码id
        /// </summary>
        /// <returns>表示异步获取验证码的任务</returns>
        public async Task<CaptchaDto> GetCaptchaAsync()
        {
            var captcha = await _dbContext.Captcha.FindAsync(Context.ConnectionId);
            if (captcha != null)
            {
                // 删除旧验证码
                _dbContext.Captcha.Remove(captcha);

                await _dbContext.SaveChangesAsync();
            }

            var (bytes, captchaText) = await CaptchaHelper.CreateImageAsync();

            // 将验证码临时放入数据库中
            var captchaId = Context.ConnectionId;
            _dbContext.Add(new Captcha
            {
                Id = captchaId,
                Text = captchaText
            });

            await _dbContext.SaveChangesAsync();

            return new CaptchaDto
            {
                Id = captchaId,
                Image = Convert.ToBase64String(bytes)
            };
        }

        /// <summary>
        /// 失去连接
        /// </summary>
        /// <param name="exception">异常</param>
        /// <returns>表示异步处理失去连接的任务</returns>
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var captcha = await _dbContext.Captcha.FindAsync(Context.ConnectionId);
            if (captcha != null)
            {
                // 删除该验证码
                _dbContext.Captcha.Remove(captcha);

                await _dbContext.SaveChangesAsync();
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
