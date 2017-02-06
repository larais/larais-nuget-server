/// <reference types="vss-web-extension-sdk" />

VSS.init({
    usePlatformScripts: true,
    usePlatformStyles: true
});
VSS.notifyLoadSucceeded();
VSS.ready(function () {
    console.log("Hello World!");
    
});