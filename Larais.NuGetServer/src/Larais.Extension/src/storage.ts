/// <reference types="vss-web-extension-sdk" />

enum SettingsKey {
    LaraisHostAddress
}

function saveValue(key: SettingsKey, value: string): JQueryPromise<any> {
    var deferred = $.Deferred();

    VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: any) => {
        dataService.setValue(SettingsKey[key], value).then(() => { deferred.resolve(); });
    });

    return deferred;
}

function getValue(key: SettingsKey): JQueryPromise<string> {
    var deferred = $.Deferred();

    VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: any) => {
        dataService.getValue(SettingsKey[key]).then((value) =>
        {
            if (value != null) {
                deferred.resolve(value)
            } else {
                deferred.resolve();
            }
        });
    });

    return deferred;
}