export interface UserAction {
    type: string;
    target: string;
    value?: string;
    timestamp: number;
}

export interface RecordedSequence {
    actions: UserAction[];
    name: string;
    createdAt: Date;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface HuggingFaceDataset {
    id: string;
    name: string;
    description: string;
    tasks: string[];
}

export interface OpenRouterRequest {
    prompt: string;
    maxTokens: number;
    temperature: number;
}

export interface OpenRouterResponse {
    generatedText: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}