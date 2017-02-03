/// <reference path="../typings/index.d.ts" />

$(document).ready(function () {
    $(document).on('change', '.btn-file :file', function () {
        var input = $(this);
        var inputSelected: HTMLInputElement = <HTMLInputElement>(input.get(0));
        var numFiles: number = inputSelected.files ? inputSelected.files.length : 1;
        var label: string = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    $(".btn-file :file").on("fileselect", function (event, numFiles, label) {
        $("#input-filename").val(label);
    });

    $("#input-filename").click(function (e) {
        $("#File").click();
    });


    $("#HideGettingStarted").click(function (e) {
        $(this).closest(".jumbotron").hide();
    });

    $("#FeedUrl").click(function (e) {
        $(this).select();
    });

    $("#CopyFeedUrlClipboard").click(function (e) {
        $("#FeedUrl").select();
        document.execCommand("copy");
        document.getSelection().removeAllRanges(); //TODO: Currently doesn't work
        var clipboardButton = $(this);
        var oldText: string = clipboardButton.html();
        clipboardButton.toggleClass("btn-success");
        clipboardButton.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
        setTimeout(function () {
            clipboardButton.html(oldText);
            clipboardButton.toggleClass("btn-success");
        }, 1000);
    });
});