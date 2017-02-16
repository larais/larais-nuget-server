/// <reference types="vss-web-extension-sdk" />
/// <reference path="../../larais.nugetapp/scripts/feedmanager.ts" />
/// <reference path="storage.ts" />

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
        getValue(SettingsKey.LaraisHostAddress).done((value) => {
            if (value != null && value.length > 0) {
                appHost = value;
            } else {
                this.showSettingsDialog();
            }

            this.initializeUI();
            VSS.notifyLoadSucceeded();
        });
    }

    private initializeUI() {
        //Horizontal Splitter: Feed Explorer | Right Content
        var splitter = <Splitter.Splitter>Controls.Enhancement.enhance(Splitter.Splitter, $("#splitter-container"));

        //Horizontal Splitter: Packages List | Package Description
        var splitterPackage = <Splitter.Splitter>Controls.Enhancement.enhance(Splitter.Splitter, $("#splitter-package-container"));

        //Treeview
        function feedMenuActionClick(args) {
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

        this.feedListRootNode = new TreeView.TreeNode("Feeds");
        this.feedListRootNode.expanded = true;
        this.feedListRootNode.noContextMenu = true;

        var treeviewOpts: TreeView.ITreeOptions = {
            nodes: [this.feedListRootNode],
            clickToggles: false,
            useBowtieStyle: false,
        }

        var feedsAsJSON = getFeeds()
            .fail(this.errorHandler)
            .done(function (data) {
                $.each(data, function (key, value) { //TODO: Save locally
                    this.feedListRootNode.add(new TreeView.TreeNode(key));
                }.bind(this));
            }.bind(this))
            
            .always(function () {
                this.feedList = Controls.create(TreeView.TreeView, $("#feed-treeview"), treeviewOpts);
            }.bind(this));

        //TODO: Implement this dummy event
        $("#feed-treeview").bind("selectionchanged", (e) => this.onFeedSelected(e));

        //Menu
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
            executeAction: feedMenuActionClick.bind(this)
        }

        var menubar = Controls.create<Menus.MenuBar, any>(Menus.MenuBar, $("#feed-crud-menu"), menubarOpts);

        //Grid
        var gridOptions: Grids.IGridOptions = {
            height: "100%",
            width: "100%",
            source: function () {
                var result = [], i;
                for (i = 0; i < 100; i++) {
                    result[result.length] = [i, "Column 2 text" + i, "Column 3 " + Math.random()];
                }

                return result;
            }(),
            columns: [
                { text: "Column 1", index: 0, width: 50, canSortBy: false },
                { text: "Column 2", index: 1, width: 200, canSortBy: false },
                { text: "Column 3", index: 2, width: 450, canSortBy: false }]
        };

        Controls.create(Grids.Grid, $("#feed-package-grid"), gridOptions);
    }

    private onFeedSelected(e: JQueryEventObject) {
        var selectedNode = this.feedList.getSelectedNode();
        if (selectedNode) {
            console.log("EVENT Fired: onFeedSelected");
            this.LoadPackageListForFeed(selectedNode.text);
        }
    }

    private LoadFeedList() {
        //TODO: Implement
    }

    private LoadPackageListForFeed(feedName: string) {
        //TODO: Implement
        var packagesForFeed = getFeed(feedName)
            .fail(this.errorHandler)
            .done(function (data) {
                console.log(data);
            });
            
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
                appHost = result[0];
                saveValue(SettingsKey.LaraisHostAddress, appHost).done(() => {
                    dialog.close();
                });
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
}