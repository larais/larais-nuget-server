var appHost: string = "";

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

function uploadPackage(feedName: string, packageData: any): JQueryXHR {
    var formData = new FormData(); // Creating object of FormData class
    formData.append("file", packageData);

    return $.ajax({
        url: appHost + "/s/" + feedName + "/api/v2/package/",
        method: "PUT",
        cache: false,
        processData: false,
        crossDomain: true,
        contentType: false,
        data: formData
    });
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