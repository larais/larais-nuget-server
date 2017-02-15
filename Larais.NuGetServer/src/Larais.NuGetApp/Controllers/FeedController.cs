using Larais.NuGetApp.Model;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace Larais.NuGetApp.Controllers
{
    [Route("api/feed")]
    [EnableCors("LaraisAllowAny")]
    public class FeedController : Controller
    {
        private readonly SettingsManager settingsManager;
        private readonly NuGetServerService nugetServerService;

        public FeedController(SettingsManager settingsManager, NuGetServerService nugetServerService)
        {
            this.settingsManager = settingsManager;
            this.nugetServerService = nugetServerService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Json(settingsManager.Feeds);
        }

        [HttpPost]
        public IActionResult Add(string name, [FromQuery] FeedSettings settings)
        {
            settingsManager.AddFeed(name, settings);
            nugetServerService.UpdateFeeds(settingsManager.Feeds);
            return Ok();
        }

        [HttpPut]
        public IActionResult Rename(string currentName, string newName)
        {
            settingsManager.RenameFeed(currentName, newName);
            nugetServerService.UpdateFeeds(settingsManager.Feeds);
            return Ok();
        }

        [HttpDelete]
        public IActionResult Delete(string name)
        {
            settingsManager.RemoveFeed(name);
            nugetServerService.UpdateFeeds(settingsManager.Feeds);
            return Ok();
        }
    }
}
