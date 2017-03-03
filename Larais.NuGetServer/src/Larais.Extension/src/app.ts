/// <reference types="vss-web-extension-sdk" />
/// <reference path="../../larais.nugetapp/scripts/feedmanager.ts" />
/// <reference path="storage.ts" />
/// <reference path="../typings/jsrender.d.ts" />

import Controls = require("VSS/Controls");
import Splitter = require("VSS/Controls/Splitter");
import Menus = require("VSS/Controls/Menus");
import TreeView = require("VSS/Controls/TreeView");
import Dialogs = require("VSS/Controls/Dialogs");
import Grids = require("VSS/Controls/Grids");

export class LaraisExtension {
    private feedList: TreeView.TreeView = null;
    private feedListRootNode: TreeView.TreeNode = null;

    constructor() {
        getValue(SettingsKey.LaraisHostAddress)
            .done((value) => {
                if (value != null && value.length > 0) {
                    appHost = value;
                } else {
                    this.showSettingsDialog();
                }

                this.initializeUI()

                    .done(function () {
                        VSS.notifyLoadSucceeded();
                    })
                    .fail(function () {
                        VSS.notifyLoadFailed("UI Initialization failed!");
                    });
            })
            .fail(function (e) {
                VSS.notifyLoadFailed("UI Initialization failed, could not load settings!");
            });
    }

    private initializeUI(): JQueryPromise<any> {
        //Horizontal Splitter: Feed Explorer | Right Content
        var splitter = <Splitter.Splitter>Controls.Enhancement.enhance(Splitter.Splitter, $("#splitter-container"));

        //Horizontal Splitter: Packages List | Package Description
        var splitterPackage = <Splitter.Splitter>Controls.Enhancement.enhance(Splitter.Splitter, $("#splitter-package-container"));

        var loadFeedListPromise: JQueryPromise<any> = this.LoadFeedList();

        $("#feed-treeview").bind("selectionchanged", (e) => this.onFeedSelected(e));

        //Main Menu
        var menuItems: Menus.IMenuItemSpec[] = [
            { id: "newFeed", text: "Add Feed", icon: "bowtie-icon bowtie-math-plus" },
            { separator: true },
            { id: "editFeed", text: "", icon: "bowtie-icon bowtie-edit-outline" },
            { id: "deleteFeed", text: "", icon: "bowtie-icon bowtie-edit-delete" },
            { separator: true },
            { id: "settings", text: "", icon: "bowtie-icon bowtie-settings-gear" }
        ];

        var menubarOpts: Menus.MenuBarOptions = {
            orientation: "horizontal",
            items: menuItems,
            executeAction: this.onMainMenuItemClick.bind(this)
        }

        var main_menubar = Controls.create<Menus.MenuBar, any>(Menus.MenuBar, $("#feed-main-menu"), menubarOpts);

        $("#searchPackageInFeed").on('input', this.onSearchingPackageList.bind(this));

        $("#PackagesList").on("click", ".package-single-item", this.onClickPackageShowDetails.bind(this));

        // Feed Menu
        var feedMenu: Menus.IMenuItemSpec[] = [
            { id: "uploadFile", text: "Upload", icon: "bowtie-icon bowtie-transfer-upload" },
            { id: "feedPermission", text: "Permissions", icon: "bowtie-icon bowtie-security-lock-fill" },
            { id: "feedUrl", text: "Feed Link", icon: "bowtie-icon bowtie-link" }
        ];

        var feedMenuOptions: Menus.MenuBarOptions = {
            orientation: "horizontal",
            items: feedMenu,
            executeAction: this.onFeedMenuItemClick.bind(this)
        }

        var feed_menubar = Controls.create<Menus.MenuBar, any>(Menus.MenuBar, $("#feed-right-menu"), feedMenuOptions);

        $("#feedLinkPopupClose").click(this.toggleFeedLinkDialog.bind(this));

        return loadFeedListPromise;
    }

    private onMainMenuItemClick(args) {
        var selectedNode: TreeView.TreeNode = this.feedList.getSelectedNode();
        switch (args.get_commandName()) {
            case "newFeed":
                this.showAddFeedDialog();
                break;
            case "editFeed":
                if (selectedNode != null) this.showEditFeedDialog(selectedNode);
                break;
            case "deleteFeed":
                if (selectedNode != null) this.showDeleteFeedConfirmationDialog(selectedNode);
                break;
            case "settings":
                this.showSettingsDialog();
                break;
        }
    }

    private onFeedMenuItemClick(args) {
        switch (args.get_commandName()) {
            case "uploadFile":
                this.showUploadPackageDialog();
                break;
            case "feedPermission":
                break;
            case "feedUrl":
                this.toggleFeedLinkDialog();
                break;
        }
    }

    private LoadFeedList(): JQueryPromise<any> {
        this.feedListRootNode = new TreeView.TreeNode("Feeds");
        this.feedListRootNode.expanded = true;
        this.feedListRootNode.noContextMenu = true;
        
        var treeviewOpts: TreeView.ITreeOptions = {
            nodes: [this.feedListRootNode],
            clickToggles: false,
            useBowtieStyle: false,
        }

        return getFeeds()
            .fail(this.errorHandler)
            .done(function (data) {
                $.each(data, function (key, value) { //TODO: Save locally
                    this.feedListRootNode.add(new TreeView.TreeNode(key));
                }.bind(this));
            }.bind(this))
            .always(function () {
                this.feedList = Controls.create(TreeView.TreeView, $("#feed-treeview"), treeviewOpts);
            }.bind(this));
    }

    private onFeedSelected(e: JQueryEventObject) {
        console.log("EVENT Fired: onFeedSelected");
        var selectedNode = this.feedList.getSelectedNode();
        if (selectedNode) {
            this.LoadPackageListForFeed(selectedNode.text);
            $("#larais-hub-title > h1").text(selectedNode.text);
        }
    }

    private LoadPackageListForFeed(feedName: string, searchTerm?: string): JQueryPromise<any> {
        var tmpl = $.templates("#packageListTemplate");
        var data = [];
          
        $("#PackagesList").html("");
        $("#PackagesDetailView").html("");

        return getFeed(feedName, searchTerm)
            .fail(this.errorHandler)
            .done(function (xml: XMLDocument) {
                $(xml).find("entry").each(function (i, e) {
                    let possibleIcon: string = $(e).find("d\\:IconUrl").text();
                    data.push({
                        icon: (possibleIcon == "") ? "static/img/packageDefaultIcon-50x50.png" : possibleIcon,
                        title: $(e).find("title").text(),
                        version: $(e).find("d\\:Version").text()
                    });
                });

                $("#PackagesList").html(tmpl.render({ packages: data }));
            });
    }

    private onSearchingPackageList() {
        console.log("EVENT Fired: onSearchingPackageList");
        var searchTerm = $("#searchPackageInFeed").val();
        var selectedNode = this.feedList.getSelectedNode();
        if (selectedNode) {
            this.LoadPackageListForFeed(selectedNode.text, searchTerm);
        }
    }

    private onClickPackageShowDetails(e: JQueryEventObject) {
        console.log("EVENT Fired: onClickPackageShowDetails");
        $("#PackagesDetailView").html("Placeholder for package: " + $(e.currentTarget).find(".package-title").first().text());
    }

    private showAddFeedDialog() {
        var dialog = Dialogs.show(Dialogs.ModalDialog, <Dialogs.IModalDialogOptions>{
            width: 300,
            title: "Add Feed",
            content: $("#addFeedModal").clone(),
            okCallback: (result: string[]) => {
                addFeed(result[0], result[1]).done(function () {
                    this.feedListRootNode.add(new TreeView.TreeNode(result[0]));
                    this.feedList.updateNode(this.feedListRootNode);
                }.bind(this));
            }
        });

        var dialogElement = dialog.getElement();
        dialogElement.on("input", "input", (e: JQueryEventObject) => {
            dialog.setDialogResult(this.getValue(dialogElement));
            dialog.updateOkButton(!this.isEmpty(dialogElement));
        });
    }

    private showEditFeedDialog(selectedNode: TreeView.TreeNode) {
        $("#inputRenameFeedName").val(selectedNode.text);
        var dialog = Dialogs.show(Dialogs.ModalDialog, <Dialogs.IModalDialogOptions>{
            width: 300,
            title: "Rename Feed",
            content: $("#renameFeedModal").clone(),
            okCallback: (result: string[]) => {
                renameFeed(selectedNode.text, result[0]).done(function (d) {
                    selectedNode.text = result[0];
                    this.feedList.updateNode(selectedNode);
                    $("#larais-hub-title > h1").text(result[0]);
                }.bind(this));
            }
        });

        var dialogElement = dialog.getElement();
        dialogElement.on("input", (e: JQueryEventObject) => {
            dialog.setDialogResult(this.getValue(dialogElement));
            dialog.updateOkButton(!this.isEmpty(dialogElement));
        });
    }

    private showDeleteFeedConfirmationDialog(selectedNode: TreeView.TreeNode) {
        var dialog = Dialogs.show(Dialogs.ModalDialog, {
            title: "Delete Feed",
            content: $("<p/>").addClass("confirmation-text").html(`Are you sure you want to delete <b>${selectedNode.text}</b>?`),
            buttons: {
                "Yes": () => {
                    deleteFeed(selectedNode.text).done(function (d) {
                        this.feedList.removeNode(selectedNode);
                    }.bind(this));
                    dialog.close();
                },
                "No": () => {
                    dialog.close();
                }
            }
        });
    }

    private showSettingsDialog(): void {
        $("#inputNuGetAppHost").val(appHost);

        var dialog = Dialogs.show(Dialogs.ModalDialog, <Dialogs.IModalDialogOptions>{
            title: "Settings",
            resizable: false,
            hideCloseButton: true,
            content: $("#settingsModal").clone(),
            okText: "Save",
            okCallback: (result: string[]) => {
                // remove last backslash
                if (result[0].length != 0 && result[0][result[0].length - 1] === "/") {
                    result[0] = result[0].substr(0, result[0].length - 1);
                }
                
                appHost = result[0];
                saveValue(SettingsKey.LaraisHostAddress, appHost).done(() => {
                    dialog.close();
                });
                this.LoadFeedList();
            },
            cancelText: "Cancel",
            cancelCallback: () => {
                dialog.close();
            }
        });

        var dialogElement = dialog.getElement();
        dialogElement.on("input", (e: JQueryEventObject) => {
            let values = this.getValue(dialogElement);

            dialog.setDialogResult(values);
            
            let enabled: boolean = false;
            let address: string = values[0];

            if (address != null && address.length > 7 && address.indexOf(' ') == -1) {
                let addrStart = address.substring(0, 7);
                if (addrStart === "http://" || addrStart === "https:/" && address[7] === "/" && address.length > 8) {
                    enabled = true;
                }
            }

            dialog.updateOkButton(enabled);
        });
    }

    private toggleFeedLinkDialog(): void {
        var selectedNode = this.feedList.getSelectedNode();
        if (selectedNode != null) {
            $("#inputFeedLink").val(appHost + "/n/" + selectedNode.text);
        }
        $("#feedLinkPopup").toggle();
    }

    private showUploadPackageDialog(): void {

        $("#uploadPackageModal label").text("Upload package to " + this.feedList.getSelectedNode().text);

        var dialog = Dialogs.show(Dialogs.ModalDialog, <Dialogs.IModalDialogOptions>{
            width: 300,
            title: "Upload Package",
            resizable: false,
            content: $("#uploadPackageModal").clone(),
            okCallback: (result: string[]) => {
                var file = $(dialogElement).find("#inputPackageUpload").prop("files")[0];
                console.log("File: " + file);
                let feedName = this.getSelectedFeedName();
                console.log("Fname: " + feedName);
                dialog.showBusyOverlay();
                uploadPackage(feedName, file)
                    .done(() => {
                        console.log("uploaded");
                        this.LoadPackageListForFeed(feedName)
                            .always(function () {
                                dialog.hideBusyOverlay();
                                dialog.close();
                            });
                    })
                    .fail(this.errorHandler);
            },
            cancelText: "Cancel",
            cancelCallback: () => {
                dialog.close();
            }
        });

        var dialogElement = dialog.getElement();
        dialogElement.on("input", (e: JQueryEventObject) => {
            dialog.setDialogResult(this.getValue(dialogElement));
            dialog.updateOkButton(!this.isEmpty(dialogElement));
        });
    }

    //UTILS
    private isEmpty(parent: JQuery): boolean {
        return parent.find("input").filter((index: number, el: Element) => {
            return !$(el).val();
        }).length > 0;
    }

    private getValue(parent: JQuery): string[] {
        var result: string[] = [];
        parent.find("input").map((index: number, el: Element) => {
            result.push($(el).val());
        });
        return result;
    }

    private errorHandler(jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
        console.log("Ajax Error occurred!");
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    }

    private getSelectedFeedName(): string {
        return this.feedList.getSelectedNode().text
    }
}