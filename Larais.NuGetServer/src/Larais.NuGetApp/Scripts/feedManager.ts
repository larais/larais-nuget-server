var appHost = "";

function getFeeds(): JQueryXHR {
    return $.getJSON(appHost + "/api/feed");
}

function addFeed(name: string, location: string, apiKey: string = null): JQueryXHR {
    return httpCall(appHost + "/api/feed?name=" + name + "&Location=" + location + "&ApiKey=" + apiKey, "POST");
}

function renameFeed(currentName: string, newName: string): JQueryXHR {
    return httpCall(appHost + "/api/feed?currentName=" + currentName + "&newName=" + newName, "PUT");
}

function deleteFeed(name: string): JQueryXHR {
    return httpCall(appHost + "/api/feed?name=" + name, "DELETE");
}

function getFeed(feed: string, searchTerm: string = null): JQueryXHR {
    var url = appHost + "/n/" + feed + "/Search()?$filter=IsAbsoluteLatestVersion&includePrerelease=true";
    if (searchTerm != null) url += "&searchTerm='" + searchTerm + "'";

    return $.get(url);
}

function uploadPackage(): void {

}

function unlistPackage(packageId: string, version: string, feedName: string): JQueryXHR {
    return httpCall(appHost + "/s/" + feedName + "/api/v2/package/" + packageId + "/" + version, "DELETE");
}

function downloadPackage(packageId: string, version: string, feedName: string): JQueryXHR {
    return $.get(appHost + "/n/" + feedName + "/api/v2/package/" + packageId + "/" + version);
}

function httpCall(url: string, method: string): JQueryXHR {
    return $.ajax({
        url: url,
        method: method
    })
}