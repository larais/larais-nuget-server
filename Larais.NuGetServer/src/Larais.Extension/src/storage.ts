/// <reference types="vss-web-extension-sdk" />

var extensionDataService: any;

enum SettingsKey {
    LaraisHostAddress
}

function initializeStorage(): JQueryDeferred<any> {
    var deferred = $.Deferred();

    VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: any) => {
        extensionDataService = dataService;
        deferred.resolve();
    });

    return deferred;
}

function saveValue(key: SettingsKey, value: string): IPromise<{}> {
    return extensionDataService.setValue(SettingsKey[key], value);
}

function getValue(key: SettingsKey): IPromise<{}> {
    return extensionDataService.getValue(SettingsKey[key]);
}