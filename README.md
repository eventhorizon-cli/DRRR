# DRRR （取名自动漫《无头骑士异闻录 DuRaRaRa!!》）

## 简介
使用 Angular 5 和 ASP.NET Core 实现的即时聊天网站系统。本项目出于个人学习目的，若有不妥之处，请联系最下方标注的邮箱。

## 项目文件夹构成
- 前台：DRRR.Client（Angular 5）
- 后台： DRRR.Server（ASP.NET Core）
- 数据库：DB（MySql，dump.sql文件包含DDL及必要数据）

## 开发环境安装
1. 安装 [Node.js](https://nodejs.org/en/)，DRRR.Client目录下执行 `npm i` 命令。
2. 未安装 vs2017 或者 vs2017 版本低于 15.4 需单独安装 [.NET Core SDK](https://www.microsoft.com/net/core#windowscmd)，DRRR.Server 目录下执行 `dotnet restore` 命令。
3. 安装 MySql （开发时用的版本是5.7.18） 创建 Schema并导入dump文件。

## 配置文件
DRRR.Server/appsettings.json
- 数据库连接字符串：ConnectionStrings:DrrrDatabase
- 用户头像保存位置：Resources:Avatars
- 聊天记录图片保存位置：Resources:Pictures
- JWT配置：Token
- 异常LOG文件名格式及保存位置：Serilog （具体介绍请关注 [Serilog项目](https://github.com/serilog/serilog-extensions-logging-file)）

## 如何运行
1. DRRR.Client 目录下执行 `npm start` 命令。
2. vs2017 用户直接打开 DRRR.Server 解决方案以控制台程序运行，vs code用户请直接用vs code打开DRRR根目录直接运行，其他用户 DRRR.Server 目录下 运行 `dotnet run` 命令。
3. 浏览器打开localhost:3000。

## 如何发布
1. DRRR.Client 目录下执行 `ng build --prod` 命令，编译结果位于 DRRR.Client/dist 目录。
2. DRRR.Server 目录下执行 [`dotnet publish`](https://docs.microsoft.com/zh-cn/dotnet/core/tools/dotnet-publish?tabs=netcore2x)，或用vs2017 发布为文件系统。
3. 将第一步得到的 dist 文件夹中的文件复制到第二步得到的文件夹中的wwwroot文件夹中。
4. 部署 .net core 至生产环境，请参见[官方说明](https://docs.microsoft.com/zh-cn/dotnet/core/deploying/index)。
linux平台以后台方式运行,请执行 `nohup dotnet DRRR.Server.dll &`，或配置Supervisor。可通过命令行参数指定后台运行端口，如 `dotnet DRRR.Server.dll 4000`。

## 联系方式
邮箱：blurhkh@hotmail.com
