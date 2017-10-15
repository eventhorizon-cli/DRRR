@echo off
cd..
cd DRRR.Server
dotnet ef dbcontext scaffold  "server=localhost;port=3306;database=drrr;uid=drrr;pwd=drrr;sslmode=none" Pomelo.EntityFrameworkCore.Mysql -o Models -f
pause