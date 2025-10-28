import { Action } from '../types'; // Assuming Action is defined in types/index.ts

export class ActionExecutor {
    private actions: Action[];

    constructor(actions: Action[]) {
        this.actions = actions;
    }

    public async execute(): Promise<void> {
        for (const action of this.actions) {
            await this.performAction(action);
        }
    }

    private async performAction(action: Action): Promise<void> {
        switch (action.type) {
            case 'click':
                await this.clickElement(action.selector);
                break;
            case 'input':
                await this.inputText(action.selector, action.value);
                break;
            // Add more action types as needed
            default:
                console.warn(`Unknown action type: ${action.type}`);
        }
    }

    private async clickElement(selector: string): Promise<void> {
        const element = document.querySelector(selector);
        if (element) {
            element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        } else {
            console.warn(`Element not found for selector: ${selector}`);
        }
    }

    private async inputText(selector: string, value: string): Promise<void> {
        const element = document.querySelector(selector) as HTMLInputElement;
        if (element) {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            console.warn(`Input element not found for selector: ${selector}`);
        }
    }
}