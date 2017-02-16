/// <reference types="vss-web-extension-sdk" />

module Larais.Extension.Storage {

    var extensionDataService: any;

    export enum SettingsKey {
        LaraisHostAddress
    }

    export function initializeStorage(): JQueryDeferred<any> {
        var deferred = $.Deferred();

        VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: any) => {
            extensionDataService = dataService;
            deferred.resolve();
        });

        return deferred;
    }

    export function saveValue(key: SettingsKey, value: string): IPromise<{}> {
        return extensionDataService.setValue(SettingsKey[key], value);
    }

    export function getValue(key: SettingsKey): IPromise<{}> {
        return extensionDataService.getValue(SettingsKey[key]);
    }
}