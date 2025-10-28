// Action types that can be recorded
export enum ActionType {
  REFRESH = 'REFRESH',
  GOTO = 'GOTO',
  GOBACK = 'GOBACK',
  SCROLL = 'SCROLL',
  WAIT = 'WAIT',
  WRITE = 'WRITE',
  CLICK = 'CLICK',
}

// Base action interface
export interface BaseAction {
  type: ActionType;
  timestamp: number;
  screenshot?: string; // Base64 encoded screenshot
}

// Specific action types
export interface RefreshAction extends BaseAction {
  type: ActionType.REFRESH;
}

export interface GotoAction extends BaseAction {
  type: ActionType.GOTO;
  url: string;
}

export interface GoBackAction extends BaseAction {
  type: ActionType.GOBACK;
}

export interface ScrollAction extends BaseAction {
  type: ActionType.SCROLL;
  x: number;
  y: number;
}

export interface WaitAction extends BaseAction {
  type: ActionType.WAIT;
  duration: number; // milliseconds
}

export interface WriteAction extends BaseAction {
  type: ActionType.WRITE;
  text: string;
  element: string; // CSS selector or xpath
  x: number;
  y: number;
}

export interface ClickAction extends BaseAction {
  type: ActionType.CLICK;
  element: string; // CSS selector or xpath
  x: number;
  y: number;
}

// Union type for all actions
export type Action =
  | RefreshAction
  | GotoAction
  | GoBackAction
  | ScrollAction
  | WaitAction
  | WriteAction
  | ClickAction;

// Task interface
export interface Task {
  id: string;
  description: string;
  generatedAt: number;
  source: 'llm' | 'database';
}

// Recording sequence
export interface RecordingSequence {
  id: string;
  taskId: string;
  taskDescription: string;
  actions: Action[];
  startTime: number;
  endTime?: number;
  success?: boolean;
  url: string; // Starting URL
}

// Recording state
export interface RecordingState {
  isRecording: boolean;
  currentTask?: Task;
  currentSequence?: RecordingSequence;
}

// Message types for communication between components
export enum MessageType {
  START_RECORDING = 'START_RECORDING',
  STOP_RECORDING = 'STOP_RECORDING',
  CAPTURE_ACTION = 'CAPTURE_ACTION',
  CAPTURE_SCREENSHOT = 'CAPTURE_SCREENSHOT',
  GET_TASK = 'GET_TASK',
  SUBMIT_SEQUENCE = 'SUBMIT_SEQUENCE',
}

export interface Message {
  type: MessageType;
  payload?: any;
}

// API Configuration
export interface OpenRouterConfig {
  apiKey: string;
  model: string;
}

export interface HuggingFaceConfig {
  apiKey: string;
  datasetRepo: string;
}
