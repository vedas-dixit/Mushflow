"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Undo, Redo, X, Pin, Tag, Flag } from 'lucide-react';
import { PlaceholderText } from '@/utils/usePlaceholdertext';
import { useHistory, createDebouncedSave } from '@/utils/useHandleAddHistory';
import ModernDatePicker from '../datepickercomponent/DatePickerComponent';
import { saveTask } from '@/utils/taskService';
import { TaskPriority } from '@/types/Task';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/Task';
import { PredefinedLabels } from '@/utils/predefinedLabels';

// Helper for client-side detection
const isBrowser = typeof window !== 'undefined';

interface TaskAddBarProps {
  onTaskAdd?: (newTask: Task) => void;
}

function TaskAddBar({ onTaskAdd }: TaskAddBarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>('low');
  const [labels, setLabels] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showLabelsMenu, setShowLabelsMenu] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);
  const labelsMenuRef = useRef<HTMLDivElement>(null);
  
  const [placeholder, setPlaceholder] = useState(PlaceholderText[0]);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  
  // Initialize history management
  const {
    canUndo,
    canRedo,
    saveToHistory,
    handleUndo: undoHistory,
    handleRedo: redoHistory,
    resetHistory
  } = useHistory({ 
    title: '', 
    note: '', 
    dueDate: null,
    priority: 'low',
    labels: [],
    isPinned: false
  });

  // Create debounced save function
  const debouncedSave = React.useMemo(
    () => createDebouncedSave(saveToHistory),
    [saveToHistory]
  );

  // Predefined labels

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      
      // Set a maximum height for the textarea to enable scrolling
      const maxHeight = isBrowser ? window.innerHeight * 0.5 : 300; // 50% of viewport height or default 300px
      
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
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

  // Add window resize handler to readjust textarea height
  useEffect(() => {
    if (!isBrowser) return;
    
    const handleResize = () => {
      adjustTextareaHeight();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClickOutside = async (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      // If clicking outside, save any content before closing
      await handleClose();
    }
    
    // Close priority menu when clicking outside
    if (priorityMenuRef.current && !priorityMenuRef.current.contains(event.target as Node)) {
      setShowPriorityMenu(false);
    }
    
    // Close labels menu when clicking outside
    if (labelsMenuRef.current && !labelsMenuRef.current.contains(event.target as Node)) {
      setShowLabelsMenu(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, title, note]); // Add dependencies to ensure the latest state is used

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    adjustTextareaHeight();
    
    // If Enter is pressed without Shift, prevent default behavior (form submission)
    // but still allow new lines with Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey && !isExpanded) {
      e.preventDefault();
      setIsExpanded(true);
      resetHistory({ 
        title: '', 
        note: '', 
        dueDate: null,
        priority: 'low',
        labels: [],
        isPinned: false
      });
    }
  };

  const handleUndo = () => {
    const prevState = undoHistory();
    if (prevState) {
      setTitle(prevState.title);
      setNote(prevState.note);
      setDueDate(prevState.dueDate);
      setPriority(prevState.priority || 'low');
      setLabels(prevState.labels || []);
      setIsPinned(prevState.isPinned || false);
    }
  };

  // Handle redo with state update
  const handleRedo = () => {
    const nextState = redoHistory();
    if (nextState) {
      setTitle(nextState.title);
      setNote(nextState.note);
      setDueDate(nextState.dueDate);
      setPriority(nextState.priority || 'low');
      setLabels(nextState.labels || []);
      setIsPinned(nextState.isPinned || false);
    }
  };

  // Add keyboard shortcuts for undo/redo and escape to close
  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if (isExpanded) {
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 'Escape') {
          // Save and close when Escape is pressed
          e.preventDefault();
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [isExpanded]);

  const handleClose = async () => {
    // If there's content, save the task
    if ((title.trim() || note.trim()) && !isSaving) {
      // Call the save function
      await handleSaveTask();
    } else {
      // If no content or already saving, just reset the form
      setIsExpanded(false);
      setTitle('');
      setNote('');
      setDueDate(null);
      setPriority('low');
      setLabels([]);
      setIsPinned(false);
      resetHistory();
    }
  };

  // Function to get the current user ID from the session
  const getUserId = () => {
    if (session?.user) {
      // Use the user's ID or email as a fallback
      return session.user.id || session.user.email || "anonymous";
    }
    // Fallback to anonymous if no user is available
    return "anonymous";
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave({ 
      title: newTitle, 
      note, 
      dueDate,
      priority,
      labels,
      isPinned
    });
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    debouncedSave({ 
      title, 
      note: newNote, 
      dueDate,
      priority,
      labels,
      isPinned
    });
  };

  const handleDateChange = (date: Date | null) => {
    setDueDate(date);
    debouncedSave({ 
      title, 
      note, 
      dueDate: date,
      priority,
      labels,
      isPinned
    });
  };
  
  const handlePriorityChange = (newPriority: TaskPriority) => {
    setPriority(newPriority);
    setShowPriorityMenu(false);
    debouncedSave({ 
      title, 
      note, 
      dueDate,
      priority: newPriority,
      labels,
      isPinned
    });
  };
  
  const handleAddLabel = (labelId: string) => {
    if (!labels.includes(labelId)) {
      const newLabels = [...labels, labelId];
      setLabels(newLabels);
      debouncedSave({ 
        title, 
        note, 
        dueDate,
        priority,
        labels: newLabels,
        isPinned
      });
    }
  };
  
  const handleRemoveLabel = (labelId: string) => {
    const newLabels = labels.filter(id => id !== labelId);
    setLabels(newLabels);
    debouncedSave({ 
      title, 
      note, 
      dueDate,
      priority,
      labels: newLabels,
      isPinned
    });
  };
  
  const handleAddCustomLabel = () => {
    if (labelInput.trim()) {
      handleAddLabel(labelInput.trim());
      setLabelInput('');
    }
  };

  const handleTogglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    debouncedSave({
      title,
      note,
      dueDate,
      priority,
      labels,
      isPinned: newPinnedState
    });
  };

  // Get priority color
  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-green-500';
    }
  };

  // Handle saving the task
  const handleSaveTask = async () => {
    // Save if there's any content (title or note)
    if ((!title.trim() && !note.trim()) || isSaving) {
      // If no content or already saving, just close without saving
      setIsExpanded(false);
      return;
    }
    
    setIsSaving(true);
    
    try {
      const userId = getUserId();
      
      const taskData = {
        userId,
        title: title.trim() || 'Untitled', // Use 'Untitled' if no title is provided
        content: note,
        priority,
        labels,
        dueDate: dueDate ? dueDate.toISOString() : null,
        pinned: isPinned,
        completed: false
      };
      
      const savedTask = await saveTask(taskData);
      console.log('Task saved:', savedTask);
      
      // Notify parent component about the new task
      if (onTaskAdd && savedTask) {
        onTaskAdd(savedTask);
      }
      
      // Reset form
      setTitle('');
      setNote('');
      setDueDate(null);
      setPriority('low');
      setLabels([]);
      setIsPinned(false);
      resetHistory();
      setIsExpanded(false);
      
      // Refresh the page to show the new task
      router.refresh();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed z-[1] top-20 left-1/2 transform -translate-x-1/2 md:translate-x-[calc(-50%+32px)] w-full max-w-2xl px-4">
      <div
        ref={containerRef}
        className={`bg-neutral-800 rounded-lg shadow-lg transition-all duration-200 max-h-[80vh] overflow-hidden ${isExpanded ? 'p-4' : 'p-2'}`}
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
                resetHistory({ 
                  title: '', 
                  note: '', 
                  dueDate: null,
                  priority: 'low',
                  labels: [],
                  isPinned: false
                });
              }
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none resize-none min-h-[24px] max-h-[50vh]"
          />
          {/* {!isExpanded && (
            <button className="text-gray-400 hover:text-gray-300 ml-2">
              <Paperclip size={18}/>
            </button>
          )} */}
        </div>

        {isExpanded && (
          <div className="mt-2">
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {labels.map(labelId => {
                  const label = PredefinedLabels.find(l => l.id === labelId) || { id: labelId, name: labelId, color: '#9E9E9E' };
                  return (
                    <div 
                      key={label.id} 
                      className="flex items-center bg-opacity-20 rounded px-2 py-0.5 text-xs"
                      style={{ backgroundColor: `${label.color}40`, color: label.color }}
                    >
                      {label.name}
                      <button 
                        className="ml-1 hover:text-white"
                        onClick={() => handleRemoveLabel(label.id)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2 text-gray-400 z-[9999]">
              <ModernDatePicker
                selectedDate={dueDate}
                onChange={handleDateChange}
              />
              
              {/* Priority Selector */}
              <div className="relative">
                <button 
                  className={`p-2 hover:bg-neutral-700 rounded-full ${getPriorityColor(priority)}`}
                  onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                  title="Set priority"
                >
                  <Flag size={18} />
                </button>
                
                {showPriorityMenu && (
                  <div 
                    ref={priorityMenuRef}
                    className="absolute left-0 bottom-full mb-2 bg-neutral-700 rounded-md shadow-lg p-2 w-32"
                  >
                    <div className="text-xs text-gray-300 mb-1 px-2">Priority</div>
                    <button 
                      className="flex items-center w-full px-2 py-1 text-red-500 hover:bg-neutral-600 rounded"
                      onClick={() => handlePriorityChange('high')}
                    >
                      <Flag size={14} className="mr-2" />
                      High
                    </button>
                    <button 
                      className="flex items-center w-full px-2 py-1 text-yellow-500 hover:bg-neutral-600 rounded"
                      onClick={() => handlePriorityChange('medium')}
                    >
                      <Flag size={14} className="mr-2" />
                      Medium
                    </button>
                    <button 
                      className="flex items-center w-full px-2 py-1 text-green-500 hover:bg-neutral-600 rounded"
                      onClick={() => handlePriorityChange('low')}
                    >
                      <Flag size={14} className="mr-2" />
                      Low
                    </button>
                  </div>
                )}
              </div>
              
              {/* Labels Selector */}
              <div className="relative">
                <button 
                  className="p-2 hover:bg-neutral-700 rounded-full"
                  onClick={() => setShowLabelsMenu(!showLabelsMenu)}
                  title="Add labels"
                >
                  <Tag size={18} />
                </button>
                
                {showLabelsMenu && (
                  <div 
                    ref={labelsMenuRef}
                    className="absolute left-0 bottom-full mb-2 bg-neutral-700 rounded-md shadow-lg p-2 w-48"
                  >
                    <div className="text-xs text-gray-300 mb-1 px-2">Labels</div>
                    
                    <div className="mb-2 px-2">
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={labelInput}
                          onChange={(e) => setLabelInput(e.target.value)}
                          placeholder="Add custom label"
                          className="w-full bg-neutral-600 text-white text-xs rounded px-2 py-1 outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomLabel();
                            }
                          }}
                        />
                        <button 
                          className="ml-1 text-gray-300 hover:text-white"
                          onClick={handleAddCustomLabel}
                        >
                          <X size={14} className="rotate-45" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto">
                      {PredefinedLabels.map(label => (
                        <button 
                          key={label.id}
                          className={`flex items-center w-full px-2 py-1 hover:bg-neutral-600 rounded mb-1 ${labels.includes(label.id) ? 'bg-neutral-600' : ''}`}
                          onClick={() => labels.includes(label.id) ? handleRemoveLabel(label.id) : handleAddLabel(label.id)}
                          style={{ color: label.color }}
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: label.color }}
                          ></div>
                          {label.name}
                          {labels.includes(label.id) && (
                            <div className="ml-auto text-gray-300">
                              <X size={12} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* <button className="p-2 hover:bg-neutral-700 rounded-full">
                <Paperclip size={18}/>
              </button> */}
              
              {/* Pin Button */}
              <button 
                className={`p-2 hover:bg-neutral-700 rounded-full ${isPinned ? 'text-yellow-300' : 'text-gray-400'}`}
                onClick={handleTogglePin}
                title={isPinned ? "Unpin note" : "Pin note"}
              >
                <Pin size={18} fill={isPinned ? "currentColor" : "none"} />
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
                disabled={isSaving}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskAddBar; 