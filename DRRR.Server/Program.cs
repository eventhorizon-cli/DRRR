using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DRRR.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }
        public static IWebHost BuildWebHost(string[] args)
        {
            // 默认5000端口
            string port = "5000";
            // 通过启动参数改变监听端口
            if (args.Length > 0 && int.TryParse(args[0], out _))
                port = args[0];
            return WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .UseUrls($"http://*:{port}")
                .Build();
        }
    }
}
