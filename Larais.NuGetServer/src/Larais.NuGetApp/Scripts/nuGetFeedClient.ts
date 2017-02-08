var appHost = "";

function deletePackage(packageId: string, version: string, feed: string): void {
    $.ajax({
        url: appHost + "/feed/" + feed + "/api/v2/package/" + packageId + "/" + version,
        method: "DELETE"
    })
        .fail(function (error) {
            console.log(error);
        })
        .done(function (result) {
            console.log(result);
        });
}

function getFeed(feed: string): void {
    $.get(appHost + "/feed/" + feed)
        .fail(function (error) {
            console.log(error);
        })
        .done(function (result) {
            console.log(result);
        });
}