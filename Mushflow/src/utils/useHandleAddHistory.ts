import React from "react";
import { TaskPriority } from "@/types/Task";

// Simple debounce function
export const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Define the state structure for history tracking
export interface HistoryState {
  title: string;
  note: string;
  dueDate: Date | null;
  priority?: TaskPriority;
  labels?: string[];
  isPinned?: boolean;
  pendingFiles?: File[];
}

export interface UseHistoryResult {
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  saveToHistory: (state: HistoryState) => void;
  handleUndo: () => HistoryState | null;
  handleRedo: () => HistoryState | null;
  resetHistory: (initialState?: HistoryState) => void;
}

// Create a debounced save function for history
export const createDebouncedSave = (saveToHistory: (state: HistoryState) => void, wait = 500) => {
  return debounce((state: HistoryState) => {
    saveToHistory(state);
  }, wait);
};

// Custom hook for managing history
export const useHistory = (initialState: HistoryState): UseHistoryResult => {
  const [history, setHistory] = React.useState<HistoryState[]>([initialState]);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  // Save current state to history
  const saveToHistory = (state: HistoryState) => {
    // Only save if the state is different from the current state
    if (
      history[historyIndex].title !== state.title ||
      history[historyIndex].note !== state.note ||
      history[historyIndex].dueDate !== state.dueDate ||
      history[historyIndex].priority !== state.priority ||
      JSON.stringify(history[historyIndex].labels) !== JSON.stringify(state.labels) ||
      history[historyIndex].isPinned !== state.isPinned
    ) {
      // Remove any future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, state]);
      setHistoryIndex(newHistory.length);
    }
  };

  // Handle undo
  const handleUndo = (): HistoryState | null => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      return history[historyIndex - 1];
    }
    return null;
  };

  // Handle redo
  const handleRedo = (): HistoryState | null => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      return history[historyIndex + 1];
    }
    return null;
  };

  // Reset history
  const resetHistory = (newInitialState?: HistoryState) => {
    const initialStateToUse = newInitialState || initialState;
    setHistory([initialStateToUse]);
    setHistoryIndex(0);
  };

  return {
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    saveToHistory,
    handleUndo,
    handleRedo,
    resetHistory,
  };
};