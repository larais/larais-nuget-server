/// <reference types="vss-web-extension-sdk" />
import Controls = require("VSS/Controls");
import Splitter = require("VSS/Controls/Splitter");
import Menus = require("VSS/Controls/Menus");
import TreeView = require("VSS/Controls/TreeView");
import Dialogs = require("VSS/Controls/Dialogs");

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
                alert("");
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

var treeviewOpts: TreeView.ITreeOptions = {
    nodes: [rootNode],
    clickToggles: false,
    useBowtieStyle: false
}

var treeview = Controls.create(TreeView.TreeView, $("#feed-treeview"), treeviewOpts);