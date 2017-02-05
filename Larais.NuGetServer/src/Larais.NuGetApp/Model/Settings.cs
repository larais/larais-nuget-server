using System.Collections.Generic;

namespace Larais.NuGetApp.Model
{
    public class Settings
    {
        public string Path { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public UploadMode UploadMode { get; set; }

        public float MaxPackageSizeInMB { get; set; }

        public IDictionary<string, string> Feeds { get; set; }
    }
}
