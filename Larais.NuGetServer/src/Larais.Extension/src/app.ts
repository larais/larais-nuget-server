/// <reference types="vss-web-extension-sdk" />
/// <reference path="../../larais.nugetapp/scripts/feedmanager.ts" />


import Controls = require("VSS/Controls");
import Splitter = require("VSS/Controls/Splitter");
import Menus = require("VSS/Controls/Menus");
import TreeView = require("VSS/Controls/TreeView");
import Dialogs = require("VSS/Controls/Dialogs");
import Grids = require("VSS/Controls/Grids");

export class LaraisExtension {
    constructor() {
        this.initializeUI();
        VSS.notifyLoadSucceeded();
    }

    private initializeUI() {
        //Splitter
        var splitter = <Splitter.Splitter>Controls.Enhancement.enhance(Splitter.Splitter, $("#splitter-container"));

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
            executeAction: function (args) {
                switch (args.get_commandName()) {
                    case "newFeed":
                        //addFeed("test");
                        break;
                    case "editFeed":
                        //TODO: Get selected feed
                        break;
                    case "deleteFeed":
                        //TODO: Get selected feed
                        break;
                    default: console.log("ERROR: Unhandled menu action");
                        break;
                }
            }
        };

        var menubar = Controls.create<Menus.MenuBar, any>(Menus.MenuBar, $("#feed-crud-menu"), menubarOpts);

        //Treeview
        var rootNode = new TreeView.TreeNode("Feeds");
        rootNode.expanded = true;
        rootNode.addRange([
            new TreeView.TreeNode("MyFeed1"),
            new TreeView.TreeNode("MyFeed2"),
            new TreeView.TreeNode("MyFeed3")
        ]);
        var feed = getFeeds();
        console.log(feed);
        var treeviewOpts: TreeView.ITreeOptions = {
            nodes: [rootNode],
            clickToggles: false,
            useBowtieStyle: false
        }

        var treeview = Controls.create(TreeView.TreeView, $("#feed-treeview"), treeviewOpts);

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
                { text: "Column 1", index: 0, width: 50, canSortBy: false},
                { text: "Column 2", index: 1, width: 200, canSortBy: false },
                { text: "Column 3", index: 2, width: 450, canSortBy: false }]
        };

        Controls.create(Grids.Grid, $("#feed-package-grid"), gridOptions);
    }
}