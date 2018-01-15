using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;

namespace DRRR.Server.Utils
{
    public static class ImageHelper
    {
        /// <summary>
        /// 缩略图编码信息
        /// </summary>
        private static ImageCodecInfo _thumbEncoder;

        /// <summary>
        /// 保存后缀与MimeType对应关系的字典
        /// </summary>
        private static Dictionary<string, string> _mimeTypes;

        static ImageHelper()
        {
            _thumbEncoder = ImageCodecInfo.GetImageEncoders()
                .Where(e => e.MimeType == "image/jpeg").Single();
            _mimeTypes = new Dictionary<string, string>
            {
                [".jpg"] = "image/jpeg",
                [".jpeg"] = "image/jpeg",
                [".gif"] = "image/gif",
            };
        }

        /// <summary>
        /// 保存为缩略图
        /// </summary>
        /// <param name="bytes">图片数据</param>
        /// <param name="path">保存路径</param>
        /// <param name="maxWidth">最大宽度</param>
        /// <param name="maxHeight">最大高度</param>
        /// <param name="quality">图片质量</param>
        public static void SaveAsThumbnailImage(byte[] bytes, string path, int maxWidth, int maxHeight, long quality = 100)
        {
            SaveAsThumbnailImage(new MemoryStream(bytes), path, maxWidth, maxHeight, quality);
        }
        /// <summary>
        /// 保存为缩略图
        /// </summary>
        /// <param name="bytes">图片数据</param>
        /// <param name="path">保存路径</param>
        /// <param name="maxWidth">最大宽度</param>
        /// <param name="maxHeight">最大高度</param>
        /// <param name="quality">图片质量</param>
        public static void SaveAsThumbnailImage(Stream stream, string path, int maxWidth, int maxHeight, long quality = 100)
        {
            using (Image original = Image.FromStream(stream))
            {
                Image thumb = null;
                if (maxWidth >= original.Width && maxHeight >= original.Height)
                {
                    // 如果图片本身不是很大
                    thumb = original;
                }
                else
                {
                    int thumbWidth = Math.Min(maxWidth, original.Width);
                    int thumbHeight = thumbWidth * original.Height / original.Width;

                    if (thumbHeight > maxHeight)
                    {
                        thumbHeight = Math.Min(maxHeight, original.Height);
                        thumbWidth = thumbHeight * original.Width / original.Height;
                    }

                    thumb = original.GetThumbnailImage(thumbWidth, thumbHeight, () => false, IntPtr.Zero);
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
        public static string GetMimeType(string path)
        {
            return _mimeTypes[Path.GetExtension(path)];
        }
    }
}
