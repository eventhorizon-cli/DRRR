using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DRRR.Server.Security
{
    /// <summary>
    /// 验证码帮助类
    /// </summary>
    public static class CaptchaHelper
    {
        /// <summary>
        /// 生成验证码内容用的字符
        /// </summary>
        private static ReadOnlyCollection<char> _chars;

        static CaptchaHelper()
        {
            _chars = new ReadOnlyCollection<char>(
                Enumerable.Range(48, 10)
                .Concat(Enumerable.Range(65, 26))
                .Select(code => (char)code)
                .ToList());
        }

        /// <summary>
        /// 异步创建验证码图片并同时返回验证码图片二进制数组和验证码文本
        /// </summary>
        /// <returns>表示异步创建验证码图片的任务</returns>
        public static async Task<(byte[], string)> CreateImageAsync()
        {

            return await Task.Run(() =>
            {
                var randomCodes = GenerateRandomCodes(4);

                using (var bitmap = new Bitmap(randomCodes.Length * 40, 60))
                {
                    using (var graphics = Graphics.FromImage(bitmap))
                    {
                        Random random = new Random();
                        //清空图片背景色
                        graphics.Clear(Color.White);
                        //画图片的干扰线
                        for (int i = 0; i < random.Next(20, 30); i++)
                        {
                            int x1 = random.Next(bitmap.Width);
                            int x2 = random.Next(bitmap.Width);
                            int y1 = random.Next(bitmap.Height);
                            int y2 = random.Next(bitmap.Height);
                            graphics.DrawLine(new Pen(GetRandomColor()), x1, x2, y1, y2);
                        }

                        Font font = new Font("Arial", 40, (FontStyle.Bold | FontStyle.Italic));

                        var colors = GetRandomColors(2);

                        var brush = new LinearGradientBrush(new Rectangle(0, 0, bitmap.Width, bitmap.Height),
                            colors[0], colors[1], 1.2f, true);
                        graphics.DrawString(randomCodes, font, brush, 0, 0);

                        //画图片的前景干扰线
                        for (int i = 0; i < 100; i++)
                        {
                            int x = random.Next(bitmap.Width);
                            int y = random.Next(bitmap.Height);
                            bitmap.SetPixel(x, y, Color.FromArgb(random.Next()));
                        }

                        // 扭曲图片
                        using (var twistedBitmap = TwistImage(bitmap,
                            random.Next(0, 2) == 0,
                            random.Next(3, 7),
                            random.NextDouble() * 2 * Math.PI))
                        {
                            //画图片的边框线
                            graphics.DrawRectangle(new Pen(Color.Silver), 0, 0, twistedBitmap.Width - 1, twistedBitmap.Height - 1);

                            //保存图片数据
                            var stream = new MemoryStream();
                            twistedBitmap.Save(stream, ImageFormat.Jpeg);
                            return (stream.ToArray(), randomCodes);
                        }
                    }
                }
            });

        }
        /// <summary>
        /// 生成随机码
        /// </summary>
        /// <param name="length">随机码长度</param>
        /// <returns>返回随机码</returns>
        private static string GenerateRandomCodes(int length)
        {
            var set = new HashSet<int>();
            var random = new Random();
            while (set.Count < length)
            {
                set.Add(random.Next(36));
            }

            return new string(set.Select(num => _chars[num]).ToArray());
        }

        /// <summary>
        /// 正弦曲线Wave扭曲图片
        /// </summary>
        /// <param name="srcBmp">原位图</param>
        /// <param name="bXDir">如果扭曲则选择为True</param>
        /// <param name="multValue">波形的幅度倍数，越大扭曲的程度越高,一般为3</param>
        /// <param name="phase">波形的起始相位,取值区间[0-2*PI)</param>
        /// <returns>扭曲后的位图</returns>
        private static Bitmap TwistImage(Bitmap srcBmp, bool bXDir, double multValue, double phase)
        {
            Bitmap destBmp = new Bitmap(srcBmp.Width, srcBmp.Height);
            using (var graph = Graphics.FromImage(destBmp))
            {
                graph.FillRectangle(new SolidBrush(Color.White), 0, 0, destBmp.Width, destBmp.Height);
            }
            double baseAxisLen = bXDir ? destBmp.Height : destBmp.Width;
            for (int i = 0; i < destBmp.Width; i++)
            {
                for (int j = 0; j < destBmp.Height; j++)
                {
                    double dx = 0;
                    dx = bXDir ? (Math.PI * 2 * j) / baseAxisLen : (Math.PI * 2 * i) / baseAxisLen;
                    dx += phase;
                    double dy = Math.Sin(dx);
                    int nOldX = 0, nOldY = 0;
                    nOldX = bXDir ? i + (int)(dy * multValue) : i;
                    nOldY = bXDir ? j : j + (int)(dy * multValue);
                    Color color = srcBmp.GetPixel(i, j);
                    if (nOldX >= 0 && nOldX < destBmp.Width
                     && nOldY >= 0 && nOldY < destBmp.Height)
                    {
                        destBmp.SetPixel(nOldX, nOldY, color);
                    }
                }
            }
            return destBmp;
        }

        /// <summary>
        /// 生成一组不重复的随机颜色
        /// </summary>
        /// <param name="count">颜色的个数</param>
        /// <returns>一组不重复的随机颜色</returns>
        private static Color[] GetRandomColors(int count)
        {
            var colors = new HashSet<Color>();
            var random = new Random();
            while (colors.Count < count)
            {
                colors.Add(GetRandomColor());
            }
            return colors.ToArray();
        }

        /// <summary>
        /// 生成随机颜色
        /// </summary>
        /// <returns>随机颜色</returns>
        private static Color GetRandomColor()
        {
            var random = new Random();

            int red = random.Next(256);
            int green = random.Next(256);

            // 尽量偏深色
            int blue = (red + green > 400) ? 0 : 400 - red - green;

            blue = (blue > 255) ? 255 : blue;
            return Color.FromArgb(red, green, blue);
        }
    }
}