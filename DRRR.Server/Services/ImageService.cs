using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using TinyPng;

namespace DRRR.Server.Utils
{
    /// <summary>
    /// 图片处理服务
    /// </summary>
    public class ImageService
    {
        /// <summary>
        /// 缩略图编码信息
        /// </summary>
        private static ImageCodecInfo _thumbEncoder;

        /// <summary>
        /// 保存后缀与MimeType对应关系的字典
        /// </summary>
        private static Dictionary<string, string> _mimeTypes;

        private readonly string _apiKey;

        static ImageService()
        {
            _thumbEncoder = ImageCodecInfo.GetImageEncoders()
                .Where(e => e.MimeType == "image/jpeg").Single();

            _mimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var info in ImageCodecInfo.GetImageEncoders())
            {
                var extensions = Regex.Matches(info.FilenameExtension, @"\.[A-Za-z]+")
                    .Select(match => match.Value);
                foreach (var extension in extensions)
                {
                    _mimeTypes[extension] = info.MimeType;
                }
            }
        }

        public ImageService(IConfiguration configuration)
        {
            _apiKey = configuration["TinyPNGAPIKey"];
        }

        /// <summary>
        /// 保存为缩略图
        /// </summary>
        /// <param name="bytes">图片数据</param>
        /// <param name="path">保存路径</param>
        /// <param name="maxWidth">最大宽度</param>
        /// <param name="maxHeight">最大高度</param>
        /// <param name="quality">图片质量</param>
        public void SaveAsThumbnailImage(byte[] bytes, string path, int maxWidth, int maxHeight, long quality = 100)
        {
            SaveAsThumbnailImage(new MemoryStream(bytes), path, maxWidth, maxHeight, quality);
        }

        /// <summary>
        /// 保存为缩略图
        /// </summary>
        /// <param name="stream">图片数据</param>
        /// <param name="path">保存路径</param>
        /// <param name="maxWidth">最大宽度</param>
        /// <param name="maxHeight">最大高度</param>
        /// <param name="quality">图片质量</param>
        public void SaveAsThumbnailImage(Stream stream, string path, int maxWidth, int maxHeight, long quality = 100)
        {
            SaveAsThumbnailImage(Image.FromStream(stream), path, maxWidth, maxHeight, quality);
        }

        /// <summary>
        /// 保存为缩略图
        /// </summary>
        /// <param name="original">图片数据</param>
        /// <param name="path">保存路径</param>
        /// <param name="maxWidth">最大宽度</param>
        /// <param name="maxHeight">最大高度</param>
        /// <param name="quality">图片质量</param>
        public void SaveAsThumbnailImage(Image original, string path, int maxWidth, int maxHeight, long quality = 100)
        {
            var bitmap = new Bitmap(original.Width, original.Height);
            using (original)
            {
                using (var g = Graphics.FromImage(bitmap))
                {
                    // 将透明背景转为白色，避免透明gif的略图变黑
                    g.Clear(Color.White);
                    g.DrawImageUnscaled(original, 0, 0);
                }
            }

            using (bitmap)
            {
                Image thumb = null;
                if (maxWidth >= bitmap.Width && maxHeight >= bitmap.Height)
                {
                    // 如果图片本身不是很大
                    thumb = bitmap;
                }
                else
                {
                    int thumbWidth = Math.Min(maxWidth, bitmap.Width);
                    int thumbHeight = thumbWidth * bitmap.Height / bitmap.Width;

                    if (thumbHeight > maxHeight)
                    {
                        thumbHeight = Math.Min(maxHeight, bitmap.Height);
                        thumbWidth = thumbHeight * bitmap.Width / bitmap.Height;
                    }

                    thumb = bitmap.GetThumbnailImage(thumbWidth, thumbHeight, null, IntPtr.Zero);
                }

                // 设置图片质量
                var encoderParameters = new EncoderParameters(1);
                encoderParameters.Param[0] = new EncoderParameter(Encoder.Quality, quality);

                thumb.Save(path, _thumbEncoder, encoderParameters);
            }
        }

        /// <summary>
        /// 获取图片的类型
        /// </summary>
        /// <param name="path">图片路径</param>
        /// <returns>图片类型（MimeType）</returns>
        public string GetMimeType(string path) => _mimeTypes[Path.GetExtension(path)];

        /// <summary>
        /// 判断是否为gif文件
        /// </summary>
        /// <param name="image">图片</param>
        /// <returns>true为gif，反则不是gif</returns>
        public bool IsGif(Image image) => image.RawFormat.Equals(ImageFormat.Gif);

        /// <summary>
        /// 利用TinyPNG接口压缩图片
        /// </summary>
        /// <param name="paths">图片路径</param>
        /// <returns>表示异步执行压缩图片的任务</returns>
        public async Task TinifyAsync(params string[] paths)
        {
            // 如果没有配置APIKEY
            if (string.IsNullOrEmpty(_apiKey))
            {
                await Task.CompletedTask;
            }
            using (var png = new TinyPngClient(_apiKey))
            {
                foreach (var path in paths)
                {
                    await png.Compress(path)
                        .Download()
                        .SaveImageToDisk(path);
                }
            }
        }
    }
}
