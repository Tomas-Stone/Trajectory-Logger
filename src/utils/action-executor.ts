import { Action, ActionType, RecordingSequence } from '../types';
import { getElementBySelector, clickElement, setInputValue, scrollToPosition, wait } from './dom-helpers';

/**
 * Execute a sequence of recorded actions
 */
export class ActionExecutor {
  private sequence: RecordingSequence;

  constructor(sequence: RecordingSequence) {
    this.sequence = sequence;
  }

  /**
   * Execute all actions in the sequence
   */
  public async execute(): Promise<void> {
    console.log(`[Executor] Executing sequence: ${this.sequence.id}`);
    
    for (const action of this.sequence.actions) {
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error('[Executor] Error executing action:', action, error);
        throw error;
      }
    }

    console.log('[Executor] Sequence execution completed');
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: Action): Promise<void> {
    console.log('[Executor] Executing action:', action.type);

    switch (action.type) {
      case ActionType.CLICK:
        await this.executeClick(action);
        break;

      case ActionType.WRITE:
        await this.executeWrite(action);
        break;

      case ActionType.SCROLL:
        await this.executeScroll(action);
        break;

      case ActionType.WAIT:
        await this.executeWait(action);
        break;

      case ActionType.GOTO:
        await this.executeGoto(action);
        break;

      case ActionType.GOBACK:
        await this.executeGoBack();
        break;

      case ActionType.REFRESH:
        await this.executeRefresh();
        break;

      default:
        console.warn('[Executor] Unknown action type:', action);
    }
  }

  private async executeClick(action: Extract<Action, { type: ActionType.CLICK }>): Promise<void> {
    const element = getElementBySelector(action.element);
    if (!element) {
      throw new Error(`Element not found: ${action.element}`);
    }
    clickElement(element);
    await wait(100); // Small delay after click
  }

  private async executeWrite(action: Extract<Action, { type: ActionType.WRITE }>): Promise<void> {
    const element = getElementBySelector(action.element);
    if (!element) {
      throw new Error(`Element not found: ${action.element}`);
    }
    
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      setInputValue(element, action.text);
      await wait(100); // Small delay after typing
    } else {
      throw new Error(`Element is not an input: ${action.element}`);
    }
  }

  private async executeScroll(action: Extract<Action, { type: ActionType.SCROLL }>): Promise<void> {
    scrollToPosition(action.x, action.y);
    await wait(100);
  }

  private async executeWait(action: Extract<Action, { type: ActionType.WAIT }>): Promise<void> {
    await wait(action.duration);
  }

  private async executeGoto(action: Extract<Action, { type: ActionType.GOTO }>): Promise<void> {
    window.location.href = action.url;
    // Wait for page to load
    await wait(1000);
  }

  private async executeGoBack(): Promise<void> {
    window.history.back();
    await wait(1000);
  }

  private async executeRefresh(): Promise<void> {
    window.location.reload();
  }
}
