using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using DRRR.Server.Models;
using Microsoft.AspNetCore.Diagnostics;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using DRRR.Server.Security;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IO;
using DRRR.Server.Services;

namespace DRRR.Server
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddMvc();

            // 添加MySqle配置，由于官方进展缓慢且找不到具体的文档说明，
            // 目前使用的是的第三方的Pomelo.EntityFrameworkCore
            // 类型为Scoped以避免线程安全问题
            services.AddDbContext<DrrrDbContext>(options =>
                options.UseMySql(Configuration.GetConnectionString("DrrrDatabase")));

            // 添加Jwt认证配置
            // 参考资料https://github.com/mrsheepuk/ASPNETSelfCreatedTokenAuthExample
            TokenAuthOptions.Audience = Configuration["Token:Audience"];
            TokenAuthOptions.Issuer = Configuration["Token:Issuer"];
            TokenAuthOptions.ExpiresIn = TimeSpan.FromMinutes(double.Parse(Configuration["Token:ExpiresIn"]));
            TokenAuthOptions.RefreshTokenExpiresIn = TimeSpan.FromDays(double.Parse(Configuration["Token:RefreshTokenExpiresIn"]));
            // 可以通过在方法或者类上添加[Authorize("Jwt")] 来进行保护
            services.AddAuthorization(auth =>
            {
                auth.AddPolicy("Jwt", new AuthorizationPolicyBuilder()
                    .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme)
                    .RequireAuthenticatedUser()
                    .Build());
            })
            .AddAuthentication()
            .AddJwtBearer(jwtBearerOptions =>
            {
                jwtBearerOptions.TokenValidationParameters = new TokenValidationParameters
                {
                    // 签收者用公钥对JWT进行认证，如果直接给一个私钥，则框架会生成相应的公钥去认证
                    // 参考资料https://stackoverflow.com/questions/39239051/rs256-vs-hs256-whats-the-difference
                    IssuerSigningKey = RSAKeyHelper.RSAPublicKey,
                    ValidAudience = TokenAuthOptions.Audience,
                    ValidIssuer = TokenAuthOptions.Issuer,

                    // When receiving a token, check that we've signed it.
                    ValidateIssuerSigningKey = true,

                    // When receiving a token, check that it is still valid.
                    ValidateLifetime = true,

                    // This defines the maximum allowable clock skew - i.e. provides a tolerance on the token expiry time 
                    // when validating the lifetime. As we're creating the tokens locally and validating them on the same 
                    // machines which should have synchronised time, this can be set to zero. Where external tokens are
                    // used, some leeway here could be useful.
                    ClockSkew = TimeSpan.FromMinutes(0)
                };
            });

            // 添加自定义的服务
            foreach (var type in Assembly.GetEntryAssembly().GetTypes())
            {
                if (type.Name.EndsWith("Service"))
                {
                    if (type.Name == nameof(Services.SystemMessagesService))
                    {
                        // 提供单例服务
                        services.AddSingleton(type);
                    }
                    else
                    {
                        // 每次请求都会创建新的实例
                        services.AddScoped(type);
                    }
                }
            }

            // 存放头像的目录
            UserProfileService.AvatarsDirectory = Configuration["Resources:Avatars"];
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            #region Handle Exception
            app.UseExceptionHandler(appBuilder =>
            {
                appBuilder.Use(async (context, next) =>
                {
                    var error = context.Features[typeof(IExceptionHandlerFeature)] as IExceptionHandlerFeature;

                    //when authorization has failed, should retrun a json message to client
                    if (error != null && error.Error is SecurityTokenExpiredException)
                    {
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";

                        await context.Response.WriteAsync(JsonConvert.SerializeObject(
                            new { authenticated = false, tokenExpired = true }
                        ));
                    }
                    //when orther error, retrun a error message json to client
                    else if (error != null && error.Error != null)
                    {
                        context.Response.StatusCode = 500;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync(JsonConvert.SerializeObject(
                            new { success = false, error = error.Error.Message }
                        ));
                    }
                    //when no error, do next.
                    else await next();
                });
            });
            #endregion

            // pushstate路由问题解决方案
            // 参考资料 https://stackoverflow.com/questions/38531904/angular-2-routing-with-asp-net-core-non-mvc
            DefaultFilesOptions options = new DefaultFilesOptions();
            options.DefaultFileNames.Clear();
            options.DefaultFileNames.Add("index.html");

            app.Use(async (context, next) =>
            {
                await next();

                if (context.Response.StatusCode == 404
                    && !Path.HasExtension(context.Request.Path.Value)
                    && !context.Request.Path.Value.StartsWith("/api"))
                {
                    context.Request.Path = "/index.html";
                    await next();
                }
            })
            .UseDefaultFiles(options)
            .UseAuthentication()
            .UseMvc()
            .UseStaticFiles();
        }
    }
}
