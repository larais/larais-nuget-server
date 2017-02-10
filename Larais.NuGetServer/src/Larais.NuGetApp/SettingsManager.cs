﻿using Larais.NuGetApp.Model;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;

namespace Larais.NuGetApp
{
    public class SettingsManager
    {
        private Settings settings;

        private readonly object settingsLock = new object();
        private readonly IHostingEnvironment applicationEnvironment;

        private const string settingsFileName = "settings.json";
        private const string defaultSettingsFileName = "default_settings.json";

        public SettingsManager(IHostingEnvironment applicationEnvironment)
        {
            this.applicationEnvironment = applicationEnvironment;

            if (!File.Exists(Path.Combine(applicationEnvironment.ContentRootPath, settingsFileName)))
            {
                settings = JsonConvert.DeserializeObject<Settings>(File.ReadAllText(Path.Combine(applicationEnvironment.ContentRootPath, defaultSettingsFileName)));
                FlushToDisk();
            }
            settings = JsonConvert.DeserializeObject<Settings>(File.ReadAllText(Path.Combine(applicationEnvironment.ContentRootPath, settingsFileName)));
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
                return settings.Path;
            }
            set
            {
                lock (settingsLock)
                {
                    settings.Path = value;
                    FlushToDisk();
                }
            }
        }

        public string Email
        {
            get
            {
                return settings.Email;
            }
            set
            {
                lock (settingsLock)
                {
                    settings.Email = value;
                    FlushToDisk();
                }
            }
        }

        public string Password
        {
            get
            {
                return settings.Password;
            }
            set
            {
                lock (settingsLock)
                {
                    settings.Password = value;
                    FlushToDisk();
                }
            }
        }

        public UploadMode UploadMode
        {
            get
            {
                return settings.UploadMode;
            }
            set
            {
                lock (settingsLock)
                {
                    settings.UploadMode = value;
                    FlushToDisk();
                }
            }
        }

        public float MaxPackageSizeInMB
        {
            get
            {
                return settings.MaxPackageSizeInMB;
            }
            set
            {
                lock (settingsLock)
                {
                    settings.MaxPackageSizeInMB = value;
                    FlushToDisk();
                }
            }
        }

        public IReadOnlyDictionary<string, string> Feeds
        {
            get
            {
                lock (settingsLock)
                {
                    return new ReadOnlyDictionary<string, string>(settings.Feeds);
                }
            }
        }

        public void AddFeed(string name, string location)
        {
            lock (settingsLock)
            {
                if (settings.Feeds.ContainsKey(name))
                {
                    throw new InvalidOperationException("A feed with this name already exists.");
                }

                settings.Feeds.Add(name, location);
                FlushToDisk();
            }
        }

        public void RenameFeed(string currentName, string newName)
        {
            lock (settingsLock)
            {
                if (!settings.Feeds.ContainsKey(currentName))
                {
                    throw new InvalidOperationException("A feed with this name already exists.");
                }
                
                settings.Feeds[newName] = settings.Feeds[currentName];
                settings.Feeds.Remove(currentName);
                FlushToDisk();
            }
        }

        public void RemoveFeed(string name)
        {
            lock (settingsLock)
            {
                settings.Feeds.Remove(name);
                FlushToDisk();
            }
        }

        private void FlushToDisk()
        {
            lock (settingsLock)
            {
                File.WriteAllText(Path.Combine(applicationEnvironment.ContentRootPath, settingsFileName), JsonConvert.SerializeObject(settings));
            }
        }
    }
}
