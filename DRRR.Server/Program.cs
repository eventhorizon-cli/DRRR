using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;

namespace DRRR.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // 解决Windows下控制台输出中文乱码的问题
            Console.OutputEncoding = System.Text.Encoding.Unicode;

            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }
    }
}
