using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Larais.NuGetApp
{
    public class NuGetServerProxy
    {
        private readonly HttpClient httpClient;

        private IDictionary<string, string> feedHostMapping;

        public NuGetServerProxy(IDictionary<string, string> feedHostMapping)
        {
            httpClient = new HttpClient();
            this.feedHostMapping = feedHostMapping;
        }

        public async Task Forward(HttpContext context, PathString feedPath)
        {
            string feedName = feedPath.Value.Substring(1);
            string action = null;
            
            int firstSlash = feedName.IndexOf('/');
            if (firstSlash == feedName.Length - 1)
            {
                feedName = feedName.Substring(0, feedName.Length - 1);
            }
            else if (firstSlash != -1)
            {
                action = feedName.Substring(firstSlash);
                feedName = feedName.Substring(0, firstSlash - 1);
            }

            if (!feedHostMapping.ContainsKey(feedName))
            {
                context.Response.StatusCode = 404;
                return;
            }

            string targetHost = feedHostMapping[feedName];
            string targetUri = "https://" + targetHost;

            if (action == null)
            {
                targetUri += "/nuget";
            }
            else
            {
                targetUri += action;
            }

            targetUri += context.Request.QueryString; // TODO works like this?

            var proxyRequest = new HttpRequestMessage();
            proxyRequest.RequestUri = new Uri(targetUri);

            var request = context.Request.Method;
            if (!HttpMethods.IsGet(request) &&
                !HttpMethods.IsHead(request) &&
                !HttpMethods.IsDelete(request) &&
                !HttpMethods.IsTrace(request))
            {
                var streamContent = new StreamContent(context.Request.Body);
                proxyRequest.Content = streamContent;
            }

            foreach (var header in context.Request.Headers)
            {
                if (!proxyRequest.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray()) && proxyRequest.Content != null)
                {
                    proxyRequest.Content?.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }

            proxyRequest.Method = new HttpMethod(request);

            var response = await httpClient.SendAsync(proxyRequest, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted);

            context.Response.StatusCode = (int)response.StatusCode;
            foreach (var header in response.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }

            foreach (var header in response.Content.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }

            context.Response.Headers.Remove("transfer-encoding");
            await response.Content.CopyToAsync(context.Response.Body);
        }
    }
}
