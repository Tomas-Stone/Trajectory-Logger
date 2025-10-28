import { Task } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek/deepseek-r1-0528:free';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function generateTask(apiKey: string): Promise<Task> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant that generates simple, clear web automation tasks. Generate a task that a user can perform on a website. The task should be specific and actionable. Return ONLY the task description, nothing else.',
    },
    {
      role: 'user',
      content: 'Generate a simple web automation task (e.g., "Search for \'TypeScript tutorial\' on Google", "Add a product to cart on Amazon", "Fill out a contact form").',
    },
  ];

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': chrome.runtime.getURL(''),
        'X-Title': 'Trajectory Logger',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    const taskDescription = data.choices[0].message.content.trim();

    return {
      id: crypto.randomUUID(),
      description: taskDescription,
      generatedAt: Date.now(),
      source: 'llm',
    };
  } catch (error) {
    console.error('Error generating task from OpenRouter:', error);
    throw error;
  }
}

export async function getApiKey(): Promise<string> {
  const result = await chrome.storage.sync.get('openRouterApiKey');
  return result.openRouterApiKey || '';
}

export async function setApiKey(apiKey: string): Promise<void> {
  await chrome.storage.sync.set({ openRouterApiKey: apiKey });
}
