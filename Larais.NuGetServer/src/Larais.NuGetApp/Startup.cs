using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Diagnostics;
using Microsoft.AspNetCore.Authentication.Cookies;
using Larais.NuGetApp;

namespace Larais.NuGetApp
{
    public class Startup
    {
        public static IServiceProvider ServiceProvider { get; private set; }

        private NuGetServerService nugetServerService;

        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);
            
            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; set; }
        
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication();


            services.AddMvc();

            services.AddSession();
            
            services.AddSingleton(typeof(SettingsManager));

            services.AddSingleton(typeof(NuGetServerService));

            ServiceProvider = services.BuildServiceProvider();

            nugetServerService = (NuGetServerService)ServiceProvider.GetService(typeof(NuGetServerService));
        }
        
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/error");
            }

            app.Use(async (context, next) =>
            {
                PathString feedName;
                PathString remainingPath;
                if (context.Request.Path.StartsWithSegments("/n", out feedName, out remainingPath))
                {
                    await nugetServerService.ForwardCall(context, remainingPath, true);
                }
                else if (context.Request.Path.StartsWithSegments("/s", out feedName, out remainingPath))
                {
                    await nugetServerService.ForwardCall(context, remainingPath, false);
                }
                else
                {
                    await next();
                }
            });

            app.UseStaticFiles();
            
            app.UseCookieAuthentication(new CookieAuthenticationOptions()
            {
                LoginPath = new PathString("/Admin/Login"),
                AutomaticAuthenticate = true,
                AutomaticChallenge = true,
                AuthenticationScheme = CookieAuthenticationDefaults.AuthenticationScheme
            });

            app.UseSession();

            app.Use(async (context, next) =>
            {
                Debug.WriteLine("CALL TRACKER: " + context.Request.Path.Value);
                await next();
            });

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
