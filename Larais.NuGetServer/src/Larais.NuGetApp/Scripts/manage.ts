function createFeed(): void {
    var feedName = $("#inputAddFeedName").val();
    var feedLocation = $("#inputAddFeedLocation").val();
    addFeed(feedName, feedLocation);
}

function deleteFeedDialog(feedName: string): void {
    deleteFeed(feedName);
}

function renameFeedDialog(feedName: string): void {

}

function refreshFeedGrid(): void {
    
}