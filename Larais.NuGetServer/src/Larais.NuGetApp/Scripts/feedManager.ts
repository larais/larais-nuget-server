var appHost = "http://localhost:56589";

function getFeeds(): void {
    $.get(appHost + "/api/feed")
        .fail(function (error) {
            console.log(error);
        })
        .done(function (result) {
            console.log(result);
        });
}

function addFeed(name: string, location: string): void {
    httpCall(appHost + "/api/feed?name=" + name + "&location=" + location, "POST")
        .fail(function (error) {
            console.log(error);
        })
        .done(function (result) {
            console.log(result);
        });
}

function renameFeed(currentName: string, newName: string): void {
    httpCall(appHost + "/api/feed?currentName=" + currentName + "&newName=" + newName, "PUT")
        .fail(function (error) {
            console.log(error);
        })
        .done(function (result) {
            console.log(result);
        });
}

function deleteFeed(name: string): void {
    httpCall(appHost + "/api/feed?name=" + name, "DELETE")
        .fail(function (error) {
            console.log(error);
        })
        .done(function (result) {
            console.log(result);
        });
}

function getFeed(feed: string, searchTerm: string = null): void {
    var url = appHost + "/n/" + feed + "/Search()?$filter=IsAbsoluteLatestVersion&includePrerelease=true";
    if (searchTerm != null) url += "&searchTerm='" + searchTerm + "'";

    $.get(url)
        .fail(function (error) {
            console.log(error);
        })
        .done(function (result) {
            console.log(result);
        });
}

function uploadPackage(): void {

}

function unlistPackage(packageId: string, version: string, feedName: string): void {
    httpCall(appHost + "/s/" + feedName + "/api/v2/package/" + packageId + "/" + version, "DELETE")
        .fail(function (error) {
            console.log(error);
        })
        .done(function (result) {
            console.log(result);
        });
}

function downloadPackage(packageId: string, version: string, feedName: string): void {
    $.get(appHost + "/n/" + feedName + "/api/v2/package/" + packageId + "/" + version)
        .fail(function (error) {
            console.log(error);
        })
        .done(function (result) {
            console.log("OK download");
        });

    // TODO: js download
}

function httpCall(url: string, method: string): JQueryXHR {
    return $.ajax({
        url: url,
        method: method
    })
}