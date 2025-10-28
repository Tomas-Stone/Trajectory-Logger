import { ActionSequence } from '../types';

const SEQUENCE_STORAGE_KEY = 'actionSequences';

export const saveSequence = (sequence: ActionSequence): void => {
    const sequences = getSequences();
    sequences.push(sequence);
    localStorage.setItem(SEQUENCE_STORAGE_KEY, JSON.stringify(sequences));
};

export const getSequences = (): ActionSequence[] => {
    const sequences = localStorage.getItem(SEQUENCE_STORAGE_KEY);
    return sequences ? JSON.parse(sequences) : [];
};

export const clearSequences = (): void => {
    localStorage.removeItem(SEQUENCE_STORAGE_KEY);
};