using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Text.RegularExpressions;

namespace DRRR.Server.Services
{
    /// <summary>
    /// 提供系统通知消息的服务
    /// </summary>
    public class SystemMessagesService
    {
        /// <summary>
        /// 服务器端返回用消息配置信息
        /// </summary>
        private readonly IConfiguration _systemMessageSettings;

        public SystemMessagesService()
        {
            _systemMessageSettings = new ConfigurationBuilder()
                .SetBasePath(Path.Combine(AppContext.BaseDirectory, "Resources"))
                .AddJsonFile("system-messages.server.json", optional: false, reloadOnChange: true)
                .AddEnvironmentVariables().Build();
        }

        /// <summary>
        /// 获取服务器端系统消息
        /// </summary>
        /// <param name="msgId">消息ID</param>
        /// <param name="args">用于替换占位符的参数</param>
        /// <returns>服务器端系统消息</returns>
        public string GetMessage(string msgId, params string[] args)
        {
            string value = _systemMessageSettings[msgId];
            return Regex.Replace(value, @"{(\d)}", match => args[int.Parse(match.Groups[1].Value)]);
        }
    }
}
