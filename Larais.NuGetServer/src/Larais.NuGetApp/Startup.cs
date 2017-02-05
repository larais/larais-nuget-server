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
        private NuGetServerProxy nugetServerProxy;

        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            if (env.IsDevelopment())
            {
                // For more details on using the user secret store see http://go.microsoft.com/fwlink/?LinkID=532709
                //builder.AddUserSecrets();
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();

            nugetServerProxy = new NuGetServerProxy(new Dictionary<string, string>());
        }

        public IConfigurationRoot Configuration { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication();


            services.AddMvc();

            //services.AddCaching();
            services.AddSession();

            // Add custom services.
            services.AddSingleton(typeof(SettingsManager));
            //services.AddSingleton<IPackageService, PackageService>();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
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
                if (context.Request.Path.StartsWithSegments("/feed", out feedName, out remainingPath) && remainingPath.HasValue && remainingPath.Value.Length != 1)
                {
                    await nugetServerProxy.Forward(context, remainingPath);
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

            //app.UseMvcWithDefaultRoute();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
