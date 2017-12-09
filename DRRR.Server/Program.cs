using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

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
            // 此处因为不需要往下传递命令行参数，故去除
            return WebHost.CreateDefaultBuilder()
                .UseStartup<Startup>()
                .UseUrls($"http://*:{port}")
                .Build();
        }
    }
}
