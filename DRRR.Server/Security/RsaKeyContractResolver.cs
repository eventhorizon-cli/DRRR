using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Reflection;

namespace DRRR.Server.Security
{
    /// <summary>
    /// RsaKey序列化格式定义
    /// 参考资料 https://github.com/IdentityServer/IdentityServer4/blob/74827bc4df39c2234d9490ba5ce032ce806ab475/src/IdentityServer4/Configuration/DependencyInjection/BuilderExtensions/Crypto.cs
    /// </summary>
    public class RsaKeyContractResolver : DefaultContractResolver
    {
        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            var property = base.CreateProperty(member, memberSerialization);

            property.Ignored = false;

            return property;
        }
    }
}
