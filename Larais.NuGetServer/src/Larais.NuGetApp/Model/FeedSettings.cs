using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Larais.NuGetApp.Model
{
    public class FeedSettings
    {
        [JsonProperty(Required = Required.Always)]
        public string Location { get; set; }

        public string ApiKey { get; set; }
    }
}
