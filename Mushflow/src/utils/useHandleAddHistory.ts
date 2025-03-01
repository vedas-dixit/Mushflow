import React from "react";

// Simple debounce function
export const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export interface HistoryState {
  title: string;
  note: string;
  dueDate: Date | null;
  [key: string]: any; 
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

export const useHistory = (
  initialState: HistoryState,
  maxHistorySize = 50
): UseHistoryResult => {
  const [history, setHistory] = React.useState<HistoryState[]>([initialState]);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Save state to history
  const saveToHistory = React.useCallback((newState: HistoryState) => {
    // Compare with current state to avoid duplicate entries
    const currentState = history[historyIndex];
    const hasChanged = Object.keys(newState).some(
      key => newState[key] !== currentState[key]
    );

    if (hasChanged) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setHistoryIndex(prev => prev - 1);
      }
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex, maxHistorySize]);

  // Handle undo
  const handleUndo = React.useCallback(() => {
    if (canUndo) {
      const prevState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      return prevState;
    }
    return null;
  }, [canUndo, history, historyIndex]);

  // Handle redo
  const handleRedo = React.useCallback(() => {
    if (canRedo) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      return nextState;
    }
    return null;
  }, [canRedo, history, historyIndex]);

  // Reset history
  const resetHistory = React.useCallback((newInitialState = initialState) => {
    setHistory([newInitialState]);
    setHistoryIndex(0);
  }, [initialState]);

  return {
    history,
    historyIndex,
    canUndo,
    canRedo,
    saveToHistory,
    handleUndo,
    handleRedo,
    resetHistory
  };
};

// Create a debounced history saver
export const createDebouncedSave = (
  saveToHistory: (state: HistoryState) => void,
  wait = 300
) => {
  return debounce((state: HistoryState) => {
    saveToHistory(state);
  }, wait);
};