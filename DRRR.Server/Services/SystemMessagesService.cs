using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
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
        /// 配置文件更新监听器
        /// </summary>
        private FileSystemWatcher _watcher;

        /// <summary>
        /// 服务器端返回用消息通知配置信息
        /// </summary>
        public JObject _serverSystemMessageSettings;

        /// <summary>
        /// 客户端消息通知配置信息
        /// </summary>
        public JsonResult ClientSystemMessageSettings { get; private set; }

        public SystemMessagesService()
        {
            _watcher = new FileSystemWatcher();
            _watcher.Path = Path.Combine(AppContext.BaseDirectory, "Resources");
            _watcher.Changed += ReloadFiles;
            _watcher.NotifyFilter = NotifyFilters.LastWrite;
            ReloadFiles(null, null);
        }

        public string GetServerSystemMessage(string msgId, params string[] args)
        {
            string value = _serverSystemMessageSettings[msgId].Value<string>();
            return Regex.Replace(value, @"{(\d)}", match => args[int.Parse(match.Groups[1].Value)]);
        }

        /// <summary>
        /// 重新加载配置文件
        /// </summary>
        private void ReloadFiles(object sender, FileSystemEventArgs e)
        {
            // 设置为false避免重复触发事件
            _watcher.EnableRaisingEvents = false;

            // 加载客户端配置
            string jsonClient = File.ReadAllText(
                Path.Combine(AppContext.BaseDirectory,
                "Resources", "system-messages.client.json"));
            ClientSystemMessageSettings = new JsonResult(JObject.Parse(jsonClient));

            // 加载服务器端配置
            string jsonServer = File.ReadAllText(
                Path.Combine(
                    AppContext.BaseDirectory,
                    "Resources", "system-messages.server.json"));
            _serverSystemMessageSettings = JObject.Parse(jsonServer);

            // 必须将此属性设置为true才能启动监控
            _watcher.EnableRaisingEvents = true;
        }
    }
}
