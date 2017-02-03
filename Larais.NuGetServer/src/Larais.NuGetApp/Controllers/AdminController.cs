using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Larais.NuGetServer.Model;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.IO;

namespace Larais.NuGetServer.Controllers
{
    [Authorize]
    public class AdminController : Controller
    {
        private readonly SettingsManager settingsManager;

        public AdminController(SettingsManager settingsManager)
        {
            this.settingsManager = settingsManager;
        }

        public IActionResult Index()
        {
            if (!settingsManager.AdminIsConfigured())
            {
                return RedirectToAction(nameof(Setup));
            }

            AdminViewModel model = new AdminViewModel();
            model.PackagePath = settingsManager.PackagePath;
            model.AdminEmail = settingsManager.Email;
            model.UploadMode = settingsManager.UploadMode;

            return View(model);
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Setup()
        {
            if (settingsManager.AdminIsConfigured())
            {
                return RedirectToAction(nameof(Index));
            }

            AdminSetupViewModel model = new AdminSetupViewModel();
            model.PackagePath = settingsManager.PackagePath;

            return View(model);
        }

        [HttpPost]
        [AllowAnonymous]
        public IActionResult Setup(AdminSetupViewModel model)
        {
            if (ModelState.IsValid)
            {
                settingsManager.Password = model.Password;
                settingsManager.PackagePath = model.PackagePath;
                settingsManager.Email = model.Email;

                return RedirectToAction(nameof(Login));
            }

            return View(model);
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login(string returnUrl = null)
        {
            if (!settingsManager.AdminIsConfigured())
            {
                return RedirectToAction(nameof(Setup));
            }

            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            if (ModelState.IsValid)
            {
                if (model.Email == settingsManager.Email && model.Password == settingsManager.Password)
                {
                    var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, "Administrator") }, CookieAuthenticationDefaults.AuthenticationScheme));

                    await HttpContext.Authentication.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, user);

                    if (Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }
                    else
                    {
                        return RedirectToAction(nameof(HomeController.Index), "Admin");
                    }
                }
                else
                {
                    ModelState.AddModelError(string.Empty, "Email or password invalid.");
                }
            }

            return View(model);
        }

        public async Task<IActionResult> Logout()
        {
            await HttpContext.Authentication.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return View();
        }

        // Options API

        [HttpPut]
        public IActionResult UpdatePackagePath(string path)
        {
            if (!string.IsNullOrEmpty(path))
            {
                if (!Directory.Exists(path))
                {
                    return new BadRequestObjectResult(new { reason = "directory not found" });
                }

                settingsManager.PackagePath = path;

                return new NoContentResult();
            }
            else
            {
                return new BadRequestObjectResult(new { reason = "path empty" });
            }
        }

        [HttpPut]
        public IActionResult UpdateUploadMode(UploadMode mode)
        {
            settingsManager.UploadMode = mode;

            return new NoContentResult();
        }

        // Account API

        [HttpPut]
        public IActionResult UpdateAdminEmail(string email)
        {
            settingsManager.Email = email;

            return new NoContentResult();
        }

        [HttpPut]
        public IActionResult UpdateAdminPassword(string password)
        {
            settingsManager.Password = password;

            return new NoContentResult();
        }
    }
}