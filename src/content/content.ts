// This file contains the content script that interacts with web pages, allowing the extension to manipulate the DOM and capture user actions.

const actionQueue: Array<Function> = [];

function recordAction(action: Function) {
    actionQueue.push(action);
}

function executeActions() {
    actionQueue.forEach(action => action());
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "record") {
        recordAction(request.payload);
        sendResponse({ status: "recording" });
    } else if (request.action === "execute") {
        executeActions();
        sendResponse({ status: "executed" });
    }
});