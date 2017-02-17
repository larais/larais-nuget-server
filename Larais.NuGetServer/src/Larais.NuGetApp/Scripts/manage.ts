$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    refreshFeedGrid();
});


function createFeed(): void {
    lockUI();
    var feedName = $("#inputAddFeedName").val();
    var feedLocation = $("#inputAddFeedLocation").val();
    addFeed(feedName, feedLocation)
        .fail(handleError)
        .done(function () {
            refreshFeedGrid();
            $("#inputAddFeedName").val("");
            $("#inputAddFeedLocation").val("");
            unlockUI();
        });
}

function deleteFeedDialog(feedName: string): void {
    $("#modal .modal-dialog").html($("#confirmDialogTmpl").render({ name: feedName }));
    $("#modal #btnConfirm").on("click", function ()
    {
        deleteFeed(feedName)
            .fail(handleError)
            .done(refreshFeedGrid);
        hideModal();
    });
    $("#modal #btnCancel").on("click", function ()
    {
        hideModal();
    });
    showModal();
}

function renameFeedDialog(feedName: string): void {
    $("#modal .modal-dialog").html($("#renameDialogTmpl").render({ name: feedName }));
    $("#modal #btnRename").on("click", function () {
        let newName = $("#inputNewFeedName").val();
        renameFeed(feedName, newName)
            .fail(handleError)
            .done(refreshFeedGrid);
        hideModal();
    });
    $("#modal #btnCancel").on("click", function () {
        hideModal();
    });
    showModal();
}

function refreshFeedGrid(): void {
    lockUI();
    getFeeds()
        .fail(handleError)
        .done(function (result) {
            let feeds: any[] = [];

            for (let key in result) {
                feeds.push({ name: key, location: result[key].location });
            }

            let rows = $("#feedRowTmpl").render({ feeds: feeds });
            $("#feedTable tbody").html(rows);
            unlockUI();
        });
}

function uploadPackageToFeed(): void {
    var file = $("#inputPackageUpload").prop("files")[0];
    uploadPackage("vm-feed1", file)
        .done(() => {
            console.log("uploaded");
        })
        .fail((error) => {
            console.log("error");
        });
}

function showModal(): void {
    $("#modal").modal("show");
}

function hideModal(): void {
    $("#modal").modal("hide");
}

function handleError(error: any): void {
    unlockUI();
    console.error(error)
}

function lockUI(): void {
    $(".loader").removeClass("hidden");
    $("button").attr("disabled", "disabled");
    $(":input").attr("disabled", "disabled");
}

function unlockUI(): void {
    $(".loader").addClass("hidden");
    $("button").removeAttr("disabled");
    $(":input").removeAttr("disabled");
}