/// <reference path="../typings/index.d.ts" />
/// <reference path="model.ts" />

$(document).ready(function () {
    $("#uploadModeDropdown .dropdown-menu li a").click(function () {
        $("#selectedUploadType").text($(this).text());
        var mode: UploadMode = +$(this).attr("modeid");

        put("UpdateUploadMode", "mode=" + mode);
    });
});

function changeAdminMail(): void {
    var newMail = $("#AdminEmail").val();

    put("UpdateAdminEmail", "email=" + newMail);
}

function changePassword(): void {
    var password = $("#password").val();
    var passwordRepeat = $("#passwordRepeat").val();

    put("UpdateAdminPassword", "password=" + password);
}

/**
 * Executes a PUT action in the Admin controller with one query parameter.
 * @param action Name of the action in the controller.
 * @param queryParameter Query parameter string with key and value. E.g. "mode=1"
 */
function put(action: string, queryParameter: string): void {
    $.ajax({
        url: "/Admin/" + action + "?" + queryParameter,
        method: "PUT"
    });
}