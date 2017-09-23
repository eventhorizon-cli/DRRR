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
        /// 客户端用消息通知配置文件名
        /// </summary>
        private const string _clientConfigFileName = "system-messages.client.json";

        /// <summary>
        /// 服务端用消息通知配置文件名
        /// </summary>
        private const string _serverConfigFileName = "system-messages.server.json";

        /// <summary>
        /// 配置文件更新监听器
        /// </summary>
        private FileSystemWatcher _watcher;

        /// <summary>
        /// 服务器端返回用消息通知配置信息
        /// </summary>
        private JObject _serverSystemMessageSettings;

        /// <summary>
        /// 客户端消息通知配置信息
        /// </summary>
        public JsonResult ClientSystemMessageSettings { get; private set; }

        public SystemMessagesService()
        {
            _watcher = new FileSystemWatcher();
            _watcher.BeginInit();
            _watcher.Path = Path.Combine(AppContext.BaseDirectory, "Resources");
            _watcher.Changed += ReloadFiles;
            _watcher.NotifyFilter = NotifyFilters.LastWrite;
            _watcher.EndInit();
            ReloadFiles(null, null);
        }

        /// <summary>
        /// 获取服务器端消息
        /// </summary>
        /// <param name="msgId">消息ID</param>
        /// <param name="args">用于替换占位符的参数</param>
        /// <returns>服务器端消息</returns>
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

            try
            {
                // 加载客户端配置
                if (e == null || e.Name == _clientConfigFileName)
                {
                    string jsonClient = File.ReadAllText(
                        Path.Combine(AppContext.BaseDirectory,
                        "Resources", _clientConfigFileName));
                    ClientSystemMessageSettings = new JsonResult(JObject.Parse(jsonClient));
                }

                // 加载服务器端配置
                if (e == null || e.Name == _serverConfigFileName)
                {
                    string jsonServer = File.ReadAllText(
                    Path.Combine(
                        AppContext.BaseDirectory,
                        "Resources", _serverConfigFileName));
                    _serverSystemMessageSettings = JObject.Parse(jsonServer);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            // 必须将此属性设置为true才能启动监控
            _watcher.EnableRaisingEvents = true;
        }
    }
}
