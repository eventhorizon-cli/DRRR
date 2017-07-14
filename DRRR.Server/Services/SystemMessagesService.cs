using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DRRR.Server.Services
{
    /// <summary>
    /// 提供系统通知消息的服务
    /// </summary>
    public class SystemMessagesService
    {
        /// <summary>
        /// 配置文件更新监听器
        /// </summary>
        private FileSystemWatcher _watcher;

        /// <summary>
        /// 客户端消息通知配置信息
        /// </summary>
        public FileContentResult ClientSystemMessageSettings { get; private set; }

        /// <summary>
        /// 服务器端返回用消息通知配置信息
        /// </summary>
        public Dictionary<string, string> ServerSystemMessageSettings { get; private set; }

        public SystemMessagesService()
        {
            _watcher = new FileSystemWatcher();
            _watcher.Path = Path.Combine(AppContext.BaseDirectory, "Resources");
            _watcher.Changed += ReloadFiles;
            _watcher.NotifyFilter = NotifyFilters.LastWrite;
            ReloadFiles(null, null);
        }

        /// <summary>
        /// 重新加载配置文件
        /// </summary>
        private void ReloadFiles(object sender, FileSystemEventArgs e)
        {
            // 设置为false避免重复触发事件
            _watcher.EnableRaisingEvents = false;

            // 加载客户端配置
            byte[] bytes = File.ReadAllBytes(
                Path.Combine(AppContext.BaseDirectory,
                "Resources", "system-messages.client.json"));
            ClientSystemMessageSettings = new FileContentResult(bytes, "applictaion/json");

            // 加载服务器端配置
            ServerSystemMessageSettings = new Dictionary<string, string>();
            var mactheCollection = Regex.Matches(
                File.ReadAllText(
                    Path.Combine(
                        AppContext.BaseDirectory,
                        "Resources", "system-messages.server.json")),
                "\"([A-Z\\d]+)\"\\s*:\\s*\"(.+)\"");
            foreach (Match macth in mactheCollection)
            {
                ServerSystemMessageSettings.Add(macth.Groups[1].Value, macth.Groups[2].Value);
            }

            // 必须将此属性设置为true才能启动监控
            _watcher.EnableRaisingEvents = true;
        }
    }
}
