import { useState, useEffect } from 'react';

export interface GrowEntry {
    id: string;
    date: string;
    category: string;
    title: string;
    priorityTask: string;
    status: string;
    availableTime: string;
    obstacles: {
        internal: string;
        external: string;
    };
    actions: {
        internal: string;
        external: string;
    };
    microSteps: string[];
    smartPlan: string;
    reflection: {
        completed: boolean;
        learnings: string;
        feelings: string;
        nextSteps: string;
        aiFeedback?: string;
    };
}

export const useGrowData = () => {
    const [entries, setEntries] = useState<GrowEntry[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('grow_entries');
        if (saved) {
            try {
                setEntries(JSON.parse(saved));
            } catch {
                setEntries([]);
            }
        }
    }, []);

    const addEntry = (entry: GrowEntry) => {
        const newEntries = [entry, ...entries];
        setEntries(newEntries);
        localStorage.setItem('grow_entries', JSON.stringify(newEntries));
    };

    const updateEntry = (id: string, updates: Partial<GrowEntry>) => {
        const newEntries = entries.map(e => e.id === id ? { ...e, ...updates } : e);
        setEntries(newEntries);
        localStorage.setItem('grow_entries', JSON.stringify(newEntries));
    };

    const deleteEntry = (id: string) => {
        const newEntries = entries.filter(e => e.id !== id);
        setEntries(newEntries);
        localStorage.setItem('grow_entries', JSON.stringify(newEntries));
    };

    return { entries, addEntry, updateEntry, deleteEntry };
};
