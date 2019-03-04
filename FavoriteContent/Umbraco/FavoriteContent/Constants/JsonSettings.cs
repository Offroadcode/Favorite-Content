using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;

namespace FavoriteContent.Constants
{
    public static class JsonSettings
    {
        public static JsonSerializerSettings Settings = new Newtonsoft.Json.JsonSerializerSettings() {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };
        public static JsonSerializerSettings SettingsWithJsDates = new Newtonsoft.Json.JsonSerializerSettings()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            DateFormatHandling = DateFormatHandling.MicrosoftDateFormat,
            Converters = new List<JsonConverter>() { new JavaScriptDateTimeConverter() }
        };
    }
}
