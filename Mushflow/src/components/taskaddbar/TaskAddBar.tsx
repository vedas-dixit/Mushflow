"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Image, Undo, Redo, X, Pin, Calendar, Pencil, PencilIcon } from 'lucide-react';
import { PlaceholderText } from '@/utils/usePlaceholdertext';
import { useHistory, createDebouncedSave, HistoryState } from '@/utils/useHandleAddHistory';
import ModernDatePicker from '../datepickercomponent/DatePickerComponent';

function TaskAddBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const [placeholder, setPlaceholder] = useState(PlaceholderText[0]);
  const [drawboardVisible, setDrawboardVisible] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  // Initialize history management
  const {
    canUndo,
    canRedo,
    saveToHistory,
    handleUndo: undoHistory,
    handleRedo: redoHistory,
    resetHistory
  } = useHistory({ title: '', note: '', dueDate: null });

  // Create debounced save function
  const debouncedSave = React.useMemo(
    () => createDebouncedSave(saveToHistory),
    [saveToHistory]
  );

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * PlaceholderText.length);
      setPlaceholder(PlaceholderText[randomIndex]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [note, isExpanded]);

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef?.current?.contains(event.target)) {
      handleClose();
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleKeyDown = () => {
    adjustTextareaHeight();
  };

  // Handle undo with state update
  const handleUndo = () => {
    const prevState = undoHistory();
    if (prevState) {
      setTitle(prevState.title);
      setNote(prevState.note);
      setDueDate(prevState.dueDate);
    }
  };

  // Handle redo with state update
  const handleRedo = () => {
    const nextState = redoHistory();
    if (nextState) {
      setTitle(nextState.title);
      setNote(nextState.note);
      setDueDate(nextState.dueDate);
    }
  };

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if (isExpanded) {
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [isExpanded]);

  const handleClose = () => {
    setIsExpanded(false);
    setTitle('');
    setNote('');
    resetHistory();
  };

  const handleShowDrawBoard = () => {
    setDrawboardVisible(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave({ title: newTitle, note, dueDate });
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    debouncedSave({ title, note: newNote, dueDate });
  };

  const handleDateChange = (date: Date | null) => {
    setDueDate(date);
    debouncedSave({ title, note, dueDate: date });
  };
  

  return (
    <div className="fixed z-40 top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
      <div
        ref={containerRef}
        className={`bg-neutral-800 rounded-lg shadow-lg transition-all duration-200 ${isExpanded ? 'p-4' : 'p-2'
          }`}
      >
        <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'h-auto opacity-100 mb-2' : 'h-0 opacity-0'}`}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={handleTitleChange}
            className="w-full bg-transparent text-white placeholder-gray-400 text-lg outline-none"
          />
        </div>

        <div className="flex items-start">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder}
            value={note}
            onChange={handleNoteChange}
            onClick={() => {
              if (!isExpanded) {
                setIsExpanded(true);
                resetHistory({ title: '', note: '', dueDate: null });
              }
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none resize-none overflow-hidden min-h-[24px]"
          />
          {!isExpanded && (
            <button className="text-gray-400 hover:text-gray-300 ml-2">
              <Image size={20} />
            </button>
          )}
        </div>

        <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'h-auto opacity-100 mt-4' : 'h-0 opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2 text-gray-400 z-[9999]">
              <ModernDatePicker
                selectedDate={dueDate}
                onChange={handleDateChange}
              />
              <button className="p-2 hover:bg-neutral-700 rounded-full">
                <Image size={18} />
              </button>
              <button className="p-2 hover:bg-neutral-700 rounded-full">
                <Pin size={18} />
              </button>
              <button
                className="p-2 hover:bg-neutral-700 rounded-full"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo size={18} className={!canUndo ? "opacity-50" : ""} />
              </button>
              <button
                className="p-2 hover:bg-neutral-700 rounded-full"
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                <Redo size={18} className={!canRedo ? "opacity-50" : ""} />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-1 text-sm text-gray-300 hover:bg-neutral-700 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskAddBar;