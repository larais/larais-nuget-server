using Larais.NuGetServer.Model;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.PlatformAbstractions;
using Newtonsoft.Json;
using System.IO;
using System.Security;

namespace Larais.NuGetServer
{
    public class SettingsManager
    {
        private Settings config;
        private readonly object settingsLock = new object();
        private readonly IHostingEnvironment applicationEnvironment;
        private readonly string settingsFileName = "settings.json";
        private readonly string defaultSettingsFileName = "default_settings.json";

        public SettingsManager(IHostingEnvironment applicationEnvironment)
        {
            this.applicationEnvironment = applicationEnvironment;

            if (!File.Exists(Path.Combine(applicationEnvironment.ContentRootPath, settingsFileName)))
            {
                config = JsonConvert.DeserializeObject<Settings>(File.ReadAllText(Path.Combine(applicationEnvironment.ContentRootPath, defaultSettingsFileName)));
                FlushToDisk();
            }
            this.config = JsonConvert.DeserializeObject<Settings>(File.ReadAllText(Path.Combine(applicationEnvironment.ContentRootPath, settingsFileName)));
        }

        public void FlushToDisk()
        {
            lock (settingsLock)
            {
                File.WriteAllText(Path.Combine(applicationEnvironment.ContentRootPath, settingsFileName), JsonConvert.SerializeObject(config));
            }
        }

        public bool AdminIsConfigured()
        {
            lock (settingsLock)
            {
                return Password != string.Empty && Email != string.Empty;
            }
        }

        public string PackagePath
        {
            get
            {
                return config.Path;
            }
            set
            {
                lock (settingsLock)
                {
                    config.Path = value;
                    FlushToDisk();
                }
            }
        }

        public string Email
        {
            get
            {
                return config.Email;
            }
            set
            {
                lock (settingsLock)
                {
                    config.Email = value;
                    FlushToDisk();
                }
            }
        }

        public string Password
        {
            get
            {
                return config.Password;
            }
            set
            {
                lock (settingsLock)
                {
                    config.Password = value;
                    FlushToDisk();
                }
            }
        }

        public UploadMode UploadMode
        {
            get
            {
                return config.UploadMode;
            }
            set
            {
                lock (settingsLock)
                {
                    config.UploadMode = value;
                    FlushToDisk();
                }
            }
        }

        public float MaxPackageSizeInMB
        {
            get
            {
                return config.MaxPackageSizeInMB;
            }
            set
            {
                lock (settingsLock)
                {
                    config.MaxPackageSizeInMB = value;
                    FlushToDisk();
                }
            }
        }
    }
}
