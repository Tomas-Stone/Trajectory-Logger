import { RecordingSequence } from '../types';

const HUGGINGFACE_API_URL = 'https://huggingface.co/api';

interface DatasetUploadResponse {
  success: boolean;
  message: string;
  commitUrl?: string;
}

/**
 * Upload a recording sequence to a HuggingFace dataset
 */
export async function uploadSequenceToDataset(
  sequence: RecordingSequence,
  apiKey: string,
  datasetRepo: string
): Promise<DatasetUploadResponse> {
  try {
    // Format the sequence data for the dataset
    const dataEntry = {
      id: sequence.id,
      task_id: sequence.taskId,
      task_description: sequence.taskDescription,
      start_url: sequence.url,
      start_time: new Date(sequence.startTime).toISOString(),
      end_time: sequence.endTime ? new Date(sequence.endTime).toISOString() : null,
      success: sequence.success ?? false,
      actions: sequence.actions.map((action) => {
        const baseAction: any = {
          type: action.type,
          timestamp: action.timestamp,
        };

        // Add action-specific fields
        if ('url' in action) baseAction.url = action.url;
        if ('x' in action) baseAction.x = action.x;
        if ('y' in action) baseAction.y = action.y;
        if ('text' in action) baseAction.text = action.text;
        if ('element' in action) baseAction.element = action.element;
        if ('duration' in action) baseAction.duration = action.duration;
        
        // Include screenshot reference (not the full base64 data)
        if (action.screenshot) {
          baseAction.has_screenshot = true;
        }

        return baseAction;
      }),
    };

    // Convert to JSONL format (one JSON object per line)
    const jsonlData = JSON.stringify(dataEntry) + '\n';

    // Upload to HuggingFace dataset using the datasets API
    const uploadUrl = `${HUGGINGFACE_API_URL}/datasets/${datasetRepo}/upload/main`;
    
    const formData = new FormData();
    const blob = new Blob([jsonlData], { type: 'application/x-ndjson' });
    formData.append('file', blob, `sequence_${sequence.id}.jsonl`);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: 'Sequence uploaded successfully',
      commitUrl: result.commitUrl,
    };
  } catch (error) {
    console.error('Error uploading sequence to HuggingFace:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get HuggingFace API credentials from storage
 */
export async function getHuggingFaceConfig(): Promise<{ apiKey: string; datasetRepo: string }> {
  const result = await chrome.storage.sync.get(['huggingFaceApiKey', 'huggingFaceDatasetRepo']);
  return {
    apiKey: result.huggingFaceApiKey || '',
    datasetRepo: result.huggingFaceDatasetRepo || '',
  };
}

/**
 * Save HuggingFace API credentials to storage
 */
export async function setHuggingFaceConfig(apiKey: string, datasetRepo: string): Promise<void> {
  await chrome.storage.sync.set({
    huggingFaceApiKey: apiKey,
    huggingFaceDatasetRepo: datasetRepo,
  });
}
