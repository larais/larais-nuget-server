using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Larais.NuGetApp.Model;

namespace Larais.NuGetApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly SettingsManager settingsManager;
        private readonly NuGetServerService nugetServerService;

        public HomeController(SettingsManager settingsManager, NuGetServerService nugetServerService)
        {
            this.settingsManager = settingsManager;
            this.nugetServerService = nugetServerService;
        }

        public IActionResult Index()
        {
            if (TempData["UploadMessage"] != null)
            {
                ViewData["UploadMessage"] = TempData["UploadMessage"];
            }

            ViewData["FileIsValid"] = TempData["FileIsValid"];
            ViewData["FirstRun"] = settingsManager.Password == string.Empty;
            ViewData["FeedNames"] = settingsManager.Feeds.Select(f => f.Key);
            ViewData["Host"] = Request.Host.Value;

            return View();
        }

        public IActionResult ManageFeeds()
        {
            return View(settingsManager.Feeds.Select(f => f.Key));
        }

        public IActionResult About()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> PackageUpload(UploadViewModel model)
        {
            var fileStream = model.File.OpenReadStream();
            await nugetServerService.PushPackage(fileStream, model.TargetFeed);

            return RedirectToAction(nameof(HomeController.Index), "Home");
        }
    }
}
