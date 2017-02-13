using System.Collections.Generic;

namespace Larais.NuGetApp.Model
{
    public class Settings
    {
        public string Email { get; set; }

        public string Password { get; set; }

        public IDictionary<string, FeedSettings> Feeds { get; set; }
    }
}
