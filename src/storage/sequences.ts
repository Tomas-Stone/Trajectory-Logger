import { RecordingSequence, RecordingState, Task } from '../types';

const SEQUENCES_KEY = 'recordingSequences';
const STATE_KEY = 'recordingState';

/**
 * Save a recording sequence to Chrome storage
 */
export async function saveSequence(sequence: RecordingSequence): Promise<void> {
  const sequences = await getSequences();
  sequences.push(sequence);
  await chrome.storage.local.set({ [SEQUENCES_KEY]: sequences });
}

/**
 * Get all saved recording sequences
 */
export async function getSequences(): Promise<RecordingSequence[]> {
  const result = await chrome.storage.local.get(SEQUENCES_KEY);
  return result[SEQUENCES_KEY] || [];
}

/**
 * Get a specific sequence by ID
 */
export async function getSequenceById(id: string): Promise<RecordingSequence | null> {
  const sequences = await getSequences();
  return sequences.find((seq) => seq.id === id) || null;
}

/**
 * Delete a sequence by ID
 */
export async function deleteSequence(id: string): Promise<void> {
  const sequences = await getSequences();
  const filtered = sequences.filter((seq) => seq.id !== id);
  await chrome.storage.local.set({ [SEQUENCES_KEY]: filtered });
}

/**
 * Clear all sequences
 */
export async function clearSequences(): Promise<void> {
  await chrome.storage.local.remove(SEQUENCES_KEY);
}

/**
 * Get the current recording state
 */
export async function getRecordingState(): Promise<RecordingState> {
  const result = await chrome.storage.local.get(STATE_KEY);
  return result[STATE_KEY] || {
    isRecording: false,
    currentTask: undefined,
    currentSequence: undefined,
  };
}

/**
 * Set the recording state
 */
export async function setRecordingState(state: RecordingState): Promise<void> {
  await chrome.storage.local.set({ [STATE_KEY]: state });
}

/**
 * Start recording a new sequence
 */
export async function startRecording(task: Task, url: string): Promise<RecordingSequence> {
  const sequence: RecordingSequence = {
    id: crypto.randomUUID(),
    taskId: task.id,
    taskDescription: task.description,
    actions: [],
    startTime: Date.now(),
    url,
  };

  const state: RecordingState = {
    isRecording: true,
    currentTask: task,
    currentSequence: sequence,
  };

  await setRecordingState(state);
  return sequence;
}

/**
 * Stop recording and save the sequence
 */
export async function stopRecording(success: boolean): Promise<RecordingSequence | null> {
  const state = await getRecordingState();
  
  if (!state.currentSequence) {
    return null;
  }

  const finalSequence: RecordingSequence = {
    ...state.currentSequence,
    endTime: Date.now(),
    success,
  };

  await saveSequence(finalSequence);
  
  // Reset state
  await setRecordingState({
    isRecording: false,
    currentTask: undefined,
    currentSequence: undefined,
  });

  return finalSequence;
}
