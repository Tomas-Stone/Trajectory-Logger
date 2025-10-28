import { Action, ActionType } from '../types';
import { getElementSelector } from '../utils/dom-helpers';

export class ActionRecorder {
  private lastActionTime: number = 0;
  private isRecording: boolean = false;

  constructor() {
    this.setupEventListeners();
  }

  public start(): void {
    this.isRecording = true;
    console.log('[Recorder] Recording started');
  }

  public stop(): void {
    this.isRecording = false;
    console.log('[Recorder] Recording stopped');
  }

  private setupEventListeners(): void {
    // Click events
    document.addEventListener('click', this.handleClick.bind(this), true);
    
    // Input events (typing)
    document.addEventListener('input', this.handleInput.bind(this), true);
    
    // Scroll events
    window.addEventListener('scroll', this.handleScroll.bind(this), true);
    
    // Navigation events
    this.setupNavigationListeners();
  }

  private handleClick(event: MouseEvent): void {
    if (!this.isRecording) return;

    const target = event.target as HTMLElement;
    const selector = getElementSelector(target);
    
    const action: Action = {
      type: ActionType.CLICK,
      element: selector,
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    };

    this.captureAction(action);
  }

  private handleInput(event: Event): void {
    if (!this.isRecording) return;

    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    
    // Debounce input events
    const now = Date.now();
    if (now - this.lastActionTime < 500) {
      return;
    }
    this.lastActionTime = now;

    const selector = getElementSelector(target);
    const rect = target.getBoundingClientRect();
    
    const action: Action = {
      type: ActionType.WRITE,
      text: target.value,
      element: selector,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      timestamp: Date.now(),
    };

    this.captureAction(action);
  }

  private handleScroll(): void {
    if (!this.isRecording) return;

    // Debounce scroll events
    const now = Date.now();
    if (now - this.lastActionTime < 300) {
      return;
    }
    this.lastActionTime = now;

    const action: Action = {
      type: ActionType.SCROLL,
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now(),
    };

    this.captureAction(action);
  }

  private setupNavigationListeners(): void {
    // Listen for navigation events
    let lastUrl = window.location.href;
    
    const checkUrlChange = () => {
      if (!this.isRecording) return;
      
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        const action: Action = {
          type: ActionType.GOTO,
          url: currentUrl,
          timestamp: Date.now(),
        };
        this.captureAction(action);
        lastUrl = currentUrl;
      }
    };

    // Check for URL changes (for SPAs)
    const observer = new MutationObserver(checkUrlChange);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // Also listen to popstate for back/forward navigation
    window.addEventListener('popstate', () => {
      if (!this.isRecording) return;
      
      const action: Action = {
        type: ActionType.GOBACK,
        timestamp: Date.now(),
      };
      this.captureAction(action);
    });
  }

  private async captureAction(action: Action): Promise<void> {
    try {
      // Request screenshot from background script
      const response = await chrome.runtime.sendMessage({
        type: 'CAPTURE_SCREENSHOT',
      });

      if (response && response.screenshot) {
        action.screenshot = response.screenshot;
      }

      // Send action to background script to add to sequence
      await chrome.runtime.sendMessage({
        type: 'CAPTURE_ACTION',
        payload: action,
      });

      console.log('[Recorder] Action captured:', action.type);
    } catch (error) {
      console.error('[Recorder] Error capturing action:', error);
    }
  }
}
