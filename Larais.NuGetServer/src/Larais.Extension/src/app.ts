/// <reference types="vss-web-extension-sdk" />
/// <reference path="../../larais.nugetapp/scripts/feedmanager.ts" />

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
        this.initializeUI();
        VSS.notifyLoadSucceeded();
    }

    private initializeUI() {
        //Splitter
        var splitter = <Splitter.Splitter>Controls.Enhancement.enhance(Splitter.Splitter, $("#splitter-container"));

        //Treeview
        this.feedListRootNode = new TreeView.TreeNode("Feeds");
        this.feedListRootNode.expanded = true;
        this.feedListRootNode.noContextMenu = true;

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
            }
        }

        var treeviewOpts: TreeView.ITreeOptions = {
            nodes: [this.feedListRootNode],
            clickToggles: false,
            useBowtieStyle: false,
            //contextMenu: {
            //    items: [
            //        { id: "editFeed", text: "Edit Feed", icon: "bowtie-icon bowtie-edit-outline" },
            //        { separator: true },
            //        { id: "deleteFeed", text: "Delete Feed", icon: "bowtie-icon bowtie-edit-delete" }
            //    ],
            //    executeAction: feedMenuActionClick.bind(this),
            //    arguments: function (contextInfo) {
            //        return { item: contextInfo.item };
            //    }
            //}
        }

        var feedsAsJSON = getFeeds().done(function (data) {
            //TODO: Save locally
            $.each(data, function (key, value) {
                this.feedListRootNode.add(new TreeView.TreeNode(key));
            }.bind(this));
            this.feedList = Controls.create(TreeView.TreeView, $("#feed-treeview"), treeviewOpts);
        }.bind(this));

        //Menu
        var menuItems: Menus.IMenuItemSpec[] = [
            { id: "newFeed", text: "Add Feed", icon: "bowtie-icon bowtie-math-plus" },
            { separator: true },
            { id: "editFeed", text: "", icon: "bowtie-icon bowtie-edit-outline" },
            { id: "deleteFeed", text: "", icon: "bowtie-icon bowtie-edit-delete" }
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
}