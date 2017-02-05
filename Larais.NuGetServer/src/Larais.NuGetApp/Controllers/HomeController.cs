using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Larais.NuGetApp.Model;

namespace Larais.NuGetApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly SettingsManager settingsManager;

        //private readonly IPackageService packageService;

        public HomeController(SettingsManager settingsManager)
        {
            //this.packageService = packageService;
            this.settingsManager = settingsManager;
        }

        public IActionResult Index()
        {
            if (TempData["UploadMessage"] != null)
            {
                ViewData["UploadMessage"] = TempData["UploadMessage"];
            }

            ViewData["FileIsValid"] = TempData["FileIsValid"];

            ViewData["FirstRun"] = settingsManager.Password == string.Empty;

            return View();
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
            //if (ModelState.IsValid)
            //{
            //    TempData["FileIsValid"] = await packageService.CreatePackage(model.File);
            //    TempData["UploadMessage"] = "Package has been uploaded successfully";
            //}
            //else
            //{
            //    TempData["UploadMessage"] = "An error has occured";
            //    ModelState.AddModelError(string.Empty, "Invalid data detected.");
            //}

            return RedirectToAction(nameof(HomeController.Index), "Home");
        }
    }
}
