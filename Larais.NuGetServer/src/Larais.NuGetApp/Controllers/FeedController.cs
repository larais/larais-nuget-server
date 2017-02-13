using Larais.NuGetApp.Model;
using Microsoft.AspNetCore.Mvc;

namespace Larais.NuGetApp.Controllers
{
    [Route("api/feed")]
    public class FeedController : Controller
    {
        private readonly SettingsManager settingsManager;

        public FeedController(SettingsManager settingsManager)
        {
            this.settingsManager = settingsManager;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Json(settingsManager.Feeds);
        }

        [HttpPost]
        public IActionResult Add(string name, FeedSettings settings)
        {
            settingsManager.AddFeed(name, settings);
            return Ok();
        }

        [HttpPut]
        public IActionResult Rename(string currentName, string newName)
        {
            settingsManager.RenameFeed(currentName, newName);
            return Ok();
        }

        [HttpDelete]
        public IActionResult Delete(string name)
        {
            settingsManager.RemoveFeed(name);
            return Ok();
        }
    }
}
