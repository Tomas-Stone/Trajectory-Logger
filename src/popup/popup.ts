import { Task, MessageType } from '../types';
import { generateTask, getApiKey as getOpenRouterKey, setApiKey as setOpenRouterKey } from '../api/openrouter';
import { uploadSequenceToDataset, getHuggingFaceConfig, setHuggingFaceConfig } from '../api/huggingface';
import { getRecordingState, startRecording, stopRecording, getSequences } from '../storage/sequences';

// DOM Elements
const elements = {
  openRouterKeyInput: document.getElementById('openrouter-key') as HTMLInputElement,
  huggingFaceKeyInput: document.getElementById('huggingface-key') as HTMLInputElement,
  datasetRepoInput: document.getElementById('dataset-repo') as HTMLInputElement,
  saveConfigBtn: document.getElementById('save-config-btn') as HTMLButtonElement,
  getTaskBtn: document.getElementById('get-task-btn') as HTMLButtonElement,
  taskText: document.getElementById('task-text') as HTMLParagraphElement,
  statusIndicator: document.getElementById('status-indicator') as HTMLSpanElement,
  statusText: document.getElementById('status-text') as HTMLSpanElement,
  actionCount: document.getElementById('action-count') as HTMLSpanElement,
  startRecordingBtn: document.getElementById('start-recording-btn') as HTMLButtonElement,
  stopRecordingBtn: document.getElementById('stop-recording-btn') as HTMLButtonElement,
  submitSuccessBtn: document.getElementById('submit-success-btn') as HTMLButtonElement,
  submitFailureBtn: document.getElementById('submit-failure-btn') as HTMLButtonElement,
  sequencesList: document.getElementById('sequences-list') as HTMLDivElement,
  refreshSequencesBtn: document.getElementById('refresh-sequences-btn') as HTMLButtonElement,
  messageContainer: document.getElementById('message-container') as HTMLDivElement,
};

let currentTask: Task | null = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await updateUI();
  setupEventListeners();
  await loadSequences();
});

// Load saved configuration
async function loadConfig() {
  const openRouterKey = await getOpenRouterKey();
  const { apiKey: hfKey, datasetRepo } = await getHuggingFaceConfig();
  
  if (openRouterKey) elements.openRouterKeyInput.value = openRouterKey;
  if (hfKey) elements.huggingFaceKeyInput.value = hfKey;
  if (datasetRepo) elements.datasetRepoInput.value = datasetRepo;
}

// Setup event listeners
function setupEventListeners() {
  elements.saveConfigBtn.addEventListener('click', saveConfig);
  elements.getTaskBtn.addEventListener('click', handleGetTask);
  elements.startRecordingBtn.addEventListener('click', handleStartRecording);
  elements.stopRecordingBtn.addEventListener('click', handleStopRecording);
  elements.submitSuccessBtn.addEventListener('click', () => handleSubmit(true));
  elements.submitFailureBtn.addEventListener('click', () => handleSubmit(false));
  elements.refreshSequencesBtn.addEventListener('click', loadSequences);
}

// Save configuration
async function saveConfig() {
  try {
    const openRouterKey = elements.openRouterKeyInput.value.trim();
    const hfKey = elements.huggingFaceKeyInput.value.trim();
    const datasetRepo = elements.datasetRepoInput.value.trim();

    if (!openRouterKey || !hfKey || !datasetRepo) {
      showMessage('Please fill in all configuration fields', 'error');
      return;
    }

    await setOpenRouterKey(openRouterKey);
    await setHuggingFaceConfig(hfKey, datasetRepo);
    
    showMessage('Configuration saved successfully', 'success');
  } catch (error) {
    showMessage('Error saving configuration: ' + error, 'error');
  }
}

// Get task from LLM
async function handleGetTask() {
  try {
    elements.getTaskBtn.disabled = true;
    elements.getTaskBtn.textContent = 'Generating...';
    
    const apiKey = await getOpenRouterKey();
    if (!apiKey) {
      showMessage('Please configure OpenRouter API key first', 'error');
      return;
    }

    currentTask = await generateTask(apiKey);
    elements.taskText.textContent = currentTask.description;
    elements.startRecordingBtn.disabled = false;
    
    showMessage('Task generated successfully!', 'success');
  } catch (error) {
    showMessage('Error generating task: ' + error, 'error');
  } finally {
    elements.getTaskBtn.disabled = false;
    elements.getTaskBtn.textContent = 'Get Task';
  }
}

// Start recording
async function handleStartRecording() {
  try {
    if (!currentTask) {
      showMessage('Please get a task first', 'error');
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url || !tab.id) {
      showMessage('No active tab found', 'error');
      return;
    }

    await startRecording(currentTask, tab.url);
    
    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, { type: MessageType.START_RECORDING });
    
    showMessage('Recording started!', 'info');
    await updateUI();
  } catch (error) {
    showMessage('Error starting recording: ' + error, 'error');
  }
}

// Stop recording
async function handleStopRecording() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      await chrome.tabs.sendMessage(tab.id, { type: MessageType.STOP_RECORDING });
    }
    
    showMessage('Recording stopped. Please submit your result.', 'info');
    await updateUI();
  } catch (error) {
    showMessage('Error stopping recording: ' + error, 'error');
  }
}

// Submit recording result
async function handleSubmit(success: boolean) {
  try {
    elements.submitSuccessBtn.disabled = true;
    elements.submitFailureBtn.disabled = true;

    const sequence = await stopRecording(success);
    
    if (!sequence) {
      showMessage('No recording found to submit', 'error');
      return;
    }

    showMessage('Sequence saved locally', 'success');

    // Upload to HuggingFace
    const { apiKey, datasetRepo } = await getHuggingFaceConfig();
    
    if (apiKey && datasetRepo) {
      showMessage('Uploading to HuggingFace...', 'info');
      const result = await uploadSequenceToDataset(sequence, apiKey, datasetRepo);
      
      if (result.success) {
        showMessage('Successfully uploaded to HuggingFace!', 'success');
      } else {
        showMessage('Upload failed: ' + result.message, 'error');
      }
    }

    currentTask = null;
    await updateUI();
    await loadSequences();
  } catch (error) {
    showMessage('Error submitting: ' + error, 'error');
  } finally {
    elements.submitSuccessBtn.disabled = false;
    elements.submitFailureBtn.disabled = false;
  }
}

// Update UI based on recording state
async function updateUI() {
  const state = await getRecordingState();
  
  if (state.isRecording) {
    elements.statusIndicator.classList.add('recording');
    elements.statusText.textContent = 'Recording...';
    elements.startRecordingBtn.disabled = true;
    elements.stopRecordingBtn.disabled = false;
    elements.getTaskBtn.disabled = true;
    elements.submitSuccessBtn.disabled = true;
    elements.submitFailureBtn.disabled = true;
    
    const actionCount = state.currentSequence?.actions.length || 0;
    elements.actionCount.textContent = actionCount.toString();
  } else if (state.currentSequence && !state.currentSequence.endTime) {
    // Recording stopped but not submitted
    elements.statusIndicator.classList.remove('recording');
    elements.statusText.textContent = 'Recording Stopped';
    elements.startRecordingBtn.disabled = true;
    elements.stopRecordingBtn.disabled = true;
    elements.getTaskBtn.disabled = true;
    elements.submitSuccessBtn.disabled = false;
    elements.submitFailureBtn.disabled = false;
    
    const actionCount = state.currentSequence?.actions.length || 0;
    elements.actionCount.textContent = actionCount.toString();
  } else {
    // Not recording
    elements.statusIndicator.classList.remove('recording');
    elements.statusText.textContent = 'Not Recording';
    elements.startRecordingBtn.disabled = !currentTask;
    elements.stopRecordingBtn.disabled = true;
    elements.getTaskBtn.disabled = false;
    elements.submitSuccessBtn.disabled = true;
    elements.submitFailureBtn.disabled = true;
    elements.actionCount.textContent = '0';
  }
}

// Load and display saved sequences
async function loadSequences() {
  const sequences = await getSequences();
  
  if (sequences.length === 0) {
    elements.sequencesList.innerHTML = '<p class="empty-state">No sequences saved yet.</p>';
    return;
  }

  elements.sequencesList.innerHTML = '';
  
  sequences.slice(-10).reverse().forEach(sequence => {
    const div = document.createElement('div');
    div.className = 'sequence-item';
    
    const taskDiv = document.createElement('div');
    taskDiv.className = 'sequence-task';
    taskDiv.textContent = sequence.taskDescription;
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'sequence-meta';
    
    const successText = sequence.success ? 
      '<span class="sequence-success">✓ Success</span>' : 
      '<span class="sequence-failed">✗ Failed</span>';
    
    metaDiv.innerHTML = `${successText} • ${sequence.actions.length} actions • ${new Date(sequence.startTime).toLocaleString()}`;
    
    div.appendChild(taskDiv);
    div.appendChild(metaDiv);
    elements.sequencesList.appendChild(div);
  });
}

// Show message to user
function showMessage(text: string, type: 'success' | 'error' | 'info') {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  
  elements.messageContainer.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 4000);
}

// Update action count periodically while recording
setInterval(async () => {
  const state = await getRecordingState();
  if (state.isRecording) {
    await updateUI();
  }
}, 1000);
