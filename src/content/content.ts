import { ActionRecorder } from './recorder';
import { MessageType } from '../types';

let recorder: ActionRecorder | null = null;

// Initialize recorder when content script loads
function init() {
  recorder = new ActionRecorder();
  console.log('[Content] Action recorder initialized');
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Content] Received message:', message.type);

  switch (message.type) {
    case MessageType.START_RECORDING:
      if (recorder) {
        recorder.start();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Recorder not initialized' });
      }
      break;

    case MessageType.STOP_RECORDING:
      if (recorder) {
        recorder.stop();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Recorder not initialized' });
      }
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true; // Keep the message channel open for async response
});

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
