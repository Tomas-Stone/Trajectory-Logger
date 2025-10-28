// This file sets up the background script for the extension, handling events and managing the extension's lifecycle.

import { fetchHuggingFaceData } from '../api/huggingface';
import { sendToOpenRouter } from '../api/openrouter';
import { saveSequence, getSequences } from '../storage/sequences';

chrome.runtime.onInstalled.addListener(() => {
    console.log('Chrome Task Automation Extension installed.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchData') {
        fetchHuggingFaceData(request.dataset)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error }));
        return true; // Indicates that the response will be sent asynchronously
    }

    if (request.action === 'sendToOpenRouter') {
        sendToOpenRouter(request.payload)
            .then(response => sendResponse({ success: true, response }))
            .catch(error => sendResponse({ success: false, error }));
        return true; // Indicates that the response will be sent asynchronously
    }

    if (request.action === 'saveSequence') {
        saveSequence(request.sequence)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error }));
        return true; // Indicates that the response will be sent asynchronously
    }

    if (request.action === 'getSequences') {
        getSequences()
            .then(sequences => sendResponse({ success: true, sequences }))
            .catch(error => sendResponse({ success: false, error }));
        return true; // Indicates that the response will be sent asynchronously
    }
});