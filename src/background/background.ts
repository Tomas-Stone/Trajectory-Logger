import { Action, MessageType, RecordingState } from '../types';
import { getRecordingState, setRecordingState } from '../storage/sequences';

console.log('[Background] Service worker started');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Extension installed');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Received message:', message.type);

  switch (message.type) {
    case 'CAPTURE_SCREENSHOT':
      captureScreenshot(sender.tab?.id)
        .then((screenshot) => sendResponse({ screenshot }))
        .catch((error) => {
          console.error('[Background] Screenshot error:', error);
          sendResponse({ screenshot: null });
        });
      return true; // Keep channel open for async response

    case 'CAPTURE_ACTION':
      captureAction(message.payload)
        .then(() => sendResponse({ success: true }))
        .catch((error) => {
          console.error('[Background] Action capture error:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;

    case MessageType.START_RECORDING:
      startRecording(sender.tab?.id)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case MessageType.STOP_RECORDING:
      stopRecording(sender.tab?.id)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return false;
});

/**
 * Capture a screenshot of the active tab
 */
async function captureScreenshot(tabId?: number): Promise<string | null> {
  try {
    if (!tabId) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      tabId = tabs[0]?.id;
    }

    if (!tabId) {
      throw new Error('No active tab found');
    }

    // Capture visible tab as data URL
    const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
      format: 'png',
      quality: 80,
    });

    return dataUrl;
  } catch (error) {
    console.error('[Background] Error capturing screenshot:', error);
    return null;
  }
}

/**
 * Add action to current recording sequence
 */
async function captureAction(action: Action): Promise<void> {
  const state = await getRecordingState();

  if (!state.isRecording || !state.currentSequence) {
    throw new Error('Not currently recording');
  }

  // Add action to current sequence
  state.currentSequence.actions.push(action);
  
  await setRecordingState(state);
  console.log('[Background] Action added to sequence:', action.type);
}

/**
 * Start recording by sending message to content script
 */
async function startRecording(tabId?: number): Promise<void> {
  if (!tabId) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tabs[0]?.id;
  }

  if (!tabId) {
    throw new Error('No active tab found');
  }

  await chrome.tabs.sendMessage(tabId, { type: MessageType.START_RECORDING });
  console.log('[Background] Recording started in tab:', tabId);
}

/**
 * Stop recording by sending message to content script
 */
async function stopRecording(tabId?: number): Promise<void> {
  if (!tabId) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tabs[0]?.id;
  }

  if (!tabId) {
    throw new Error('No active tab found');
  }

  await chrome.tabs.sendMessage(tabId, { type: MessageType.STOP_RECORDING });
  console.log('[Background] Recording stopped in tab:', tabId);
}
