// This file implements the functionality to record user actions on the web page for task automation.

interface RecordedAction {
    type: string;
    target: string;
    value?: string;
    timestamp: number;
}

class ActionRecorder {
    private actions: RecordedAction[] = [];
    private isRecording: boolean = false;

    constructor() {
        this.init();
    }

    private init() {
        document.addEventListener('click', this.recordClick.bind(this));
        document.addEventListener('input', this.recordInput.bind(this));
    }

    public startRecording() {
        this.isRecording = true;
        this.actions = [];
    }

    public stopRecording() {
        this.isRecording = false;
    }

    private recordClick(event: MouseEvent) {
        if (!this.isRecording) return;

        const target = event.target as HTMLElement;
        this.actions.push({
            type: 'click',
            target: target.tagName.toLowerCase(),
            timestamp: Date.now(),
        });
    }

    private recordInput(event: Event) {
        if (!this.isRecording) return;

        const target = event.target as HTMLInputElement;
        this.actions.push({
            type: 'input',
            target: target.tagName.toLowerCase(),
            value: target.value,
            timestamp: Date.now(),
        });
    }

    public getRecordedActions() {
        return this.actions;
    }

    public clearActions() {
        this.actions = [];
    }
}

const actionRecorder = new ActionRecorder();