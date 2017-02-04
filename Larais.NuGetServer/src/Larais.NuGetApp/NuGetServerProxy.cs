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

            var requestMessage = new HttpRequestMessage();
            var requestMethod = context.Request.Method;
            if (!HttpMethods.IsGet(requestMethod) &&
                !HttpMethods.IsHead(requestMethod) &&
                !HttpMethods.IsDelete(requestMethod) &&
                !HttpMethods.IsTrace(requestMethod))
            {
                var streamContent = new StreamContent(context.Request.Body);
                requestMessage.Content = streamContent;
            }

            // Copy the request headers
            foreach (var header in context.Request.Headers)
            {
                if (!requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray()) && requestMessage.Content != null)
                {
                    requestMessage.Content?.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }

            //requestMessage.Headers.Host = targetHost;
            //var targetUri = "https://" + targetHost + 


            //requestMessage.RequestUri = new Uri(uriString);
            //requestMessage.Method = new HttpMethod(context.Request.Method);
            //using (var responseMessage = await _httpClient.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted))
            //{
            //    context.Response.StatusCode = (int)responseMessage.StatusCode;
            //    foreach (var header in responseMessage.Headers)
            //    {
            //        context.Response.Headers[header.Key] = header.Value.ToArray();
            //    }

            //    foreach (var header in responseMessage.Content.Headers)
            //    {
            //        context.Response.Headers[header.Key] = header.Value.ToArray();
            //    }

            //    // SendAsync removes chunking from the response. This removes the header so it doesn't expect a chunked response.
            //    context.Response.Headers.Remove("transfer-encoding");
            //    await responseMessage.Content.CopyToAsync(context.Response.Body);
            //}

        }
    }
}
