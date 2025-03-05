"use client";
import React, { useEffect, useState, useRef } from "react";
import { Pin, CheckCircle, Calendar, X, Flag, Tag, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Task, TaskPriority } from "@/types/Task";
import { predefinedLabels } from "@/utils/predefinedLabels";
import { updateTask, deleteTask } from "@/utils/taskService";
import { useSession } from "next-auth/react";
import ModernDatePicker from "../datepickercomponent/DatePickerComponent";

interface CardProps {
  id: string;
  userId: string;
  title: string;
  content: string;
  priority: TaskPriority;
  color?: string;
  pinned: boolean;
  completed: boolean;
  dueDate: string | null;
  labels?: string[];
  onUpdate?: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void;
}

// Predefined labels (should match those in TaskAddBar)


function Card({ 
  id, 
  userId,
  title, 
  content, 
  priority = 'low', 
  color = 'bg-neutral-800', 
  pinned, 
  completed, 
  dueDate, 
  labels = [],
  onUpdate,
  onDelete
}: CardProps) {
  const { data: session } = useSession();
  const [isPinned, setIsPinned] = useState(pinned);
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(typeof content === 'string' ? content.split('\n') : content);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(priority);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState<Date | null>(dueDate ? new Date(dueDate) : null);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
      if (textareaRef.current) {
        adjustTextareaHeight();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = window.innerHeight * 0.5; 
      
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value.split('\n'));
    adjustTextareaHeight();
    
    // Update task content with throttling
    updateTaskField('content', e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
    
    // Update task title with throttling
    updateTaskField('title', e.target.value);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setIsExpanded(false);
    }
    
    // Close date picker when clicking outside
    if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
      setShowDatePicker(false);
    }
    
    // Close priority menu when clicking outside
    if (priorityMenuRef.current && !priorityMenuRef.current.contains(e.target as Node)) {
      setShowPriorityMenu(false);
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

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
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

  // Update task field with throttling
  const updateTaskField = async (field: string, value: any) => {
    try {
      // Validate IDs before proceeding
      if (!id) {
        console.error('Cannot update task: Missing task ID');
        return;
      }
      
      if (!userId) {
        console.error('Cannot update task: Missing user ID');
        return;
      }
      
      const updateData: Partial<Task> & { id: string; userId: string } = {
        id,
        userId,
        [field]: value
      };
      
      console.log(`Updating task ${id}, field: ${field}`);
      const updatedTask = await updateTask(updateData);
      
      if (onUpdate) {
        onUpdate(updatedTask);
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  // Handle pin toggle
  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    updateTaskField('pinned', newPinned);
  };

  // Handle completion toggle
  const handleCompletionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    updateTaskField('completed', newCompleted);
  };

  // Handle priority change
  const handlePriorityChange = (newPriority: TaskPriority) => {
    setTaskPriority(newPriority);
    setShowPriorityMenu(false);
    updateTaskField('priority', newPriority);
  };

  // Handle due date change
  const handleDueDateChange = (date: Date | null) => {
    setTaskDueDate(date);
    setShowDatePicker(false);
    updateTaskField('dueDate', date ? date.toISOString() : null);
  };

  // Toggle date picker
  const toggleDatePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDatePicker(!showDatePicker);
  };

  // Toggle priority menu
  const togglePriorityMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPriorityMenu(!showPriorityMenu);
  };

  // Handle delete task
  const handleDeleteTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Validate IDs before proceeding
    if (!id) {
      console.error('Cannot delete task: Missing task ID');
      alert('Cannot delete task: Missing task ID');
      return;
    }
    
    if (!userId) {
      console.error('Cannot delete task: Missing user ID');
      alert('Cannot delete task: Missing user ID');
      return;
    }
    
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        console.log('Deleting task with ID:', id, 'and userId:', userId);
        
        await deleteTask(id, userId);
        
        if (onDelete) {
          onDelete(id);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  return (
    <>
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}
      <div
        ref={cardRef}
        className={`${
          isExpanded
            ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50"
            : "relative"
        } ${color} rounded-lg border border-gray-600 transition-all duration-200 group p-4`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="flex justify-between items-start">
          {isExpanded ? (
            <input
              type="text"
              value={editedTitle}
              onChange={handleTitleChange}
              className="w-full bg-transparent font-medium text-lg text-gray-100 outline-none"
              placeholder="Title"
            />
          ) : (
            <h3 className={`font-medium text-lg text-gray-100 ${isCompleted ? "line-through opacity-60" : ""}`}>
              {editedTitle}
            </h3>
          )}

          <div className="flex items-center gap-2">
            <button
              className={`opacity-0 group-hover:opacity-100 transition-opacity ease-in-out ${
                isPinned ? "text-yellow-100" : "text-gray-400"
              }`}
              onClick={handlePinToggle}
            >
              <Pin fill={isPinned ? "currentColor" : "none"} />
            </button>
            {isExpanded && (
              <>
                <button
                  className="text-gray-400 hover:text-red-400"
                  onClick={handleDeleteTask}
                >
                  <Trash2 size={18} />
                </button>
                <button
                  className="text-gray-400 hover:text-gray-200"
                  onClick={handleClose}
                >
                  <X size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Priority indicator with dropdown */}
        <div className="flex items-center mt-2 mb-3 relative">
          <button 
            onClick={togglePriorityMenu}
            className="flex items-center hover:bg-gray-700 rounded px-2 py-1"
          >
            <Flag size={14} className={`${getPriorityColor(taskPriority)} mr-1`} />
            <span className={`text-xs ${getPriorityColor(taskPriority)}`}>
              {taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)} Priority
            </span>
          </button>
          
          {showPriorityMenu && (
            <div 
              ref={priorityMenuRef}
              className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10"
            >
              <div className="p-1">
                <button 
                  onClick={() => handlePriorityChange('low')}
                  className="flex items-center w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded"
                >
                  <Flag size={14} className="text-green-500 mr-2" />
                  <span className="text-green-500">Low</span>
                </button>
                <button 
                  onClick={() => handlePriorityChange('medium')}
                  className="flex items-center w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded"
                >
                  <Flag size={14} className="text-yellow-500 mr-2" />
                  <span className="text-yellow-500">Medium</span>
                </button>
                <button 
                  onClick={() => handlePriorityChange('high')}
                  className="flex items-center w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded"
                >
                  <Flag size={14} className="text-red-500 mr-2" />
                  <span className="text-red-500">High</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {labels.map(labelId => {
              const label = predefinedLabels.find(l => l.id === labelId) || { id: labelId, name: labelId, color: '#9E9E9E' };
              return (
                <div 
                  key={label.id} 
                  className="flex items-center bg-opacity-20 rounded px-2 py-0.5 text-xs"
                  style={{ backgroundColor: `${label.color}40`, color: label.color }}
                >
                  {label.name}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-2">
          {isExpanded ? (
            <textarea
              ref={textareaRef}
              value={editedContent.join('\n')}
              onChange={handleContentChange}
              className="w-full bg-transparent outline-none resize-none min-h-[100px] text-gray-200"
              placeholder="Add note content..."
            />
          ) : (
            <div className="text-gray-300">
              {Array.isArray(editedContent) ? (
                editedContent.map((item: string, index: number) => (
                  <p key={index} className={`mb-1 ${isCompleted ? "line-through opacity-60" : ""}`}>
                    • {item}
                  </p>
                ))
              ) : (
                <p className={`mb-1 ${isCompleted ? "line-through opacity-60" : ""}`}>
                  • {editedContent}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            className={`flex items-center gap-1 ${
              isCompleted ? "text-green-400" : "text-gray-400"
            }`}
            onClick={handleCompletionToggle}
          >
            <CheckCircle fill={isCompleted ? "currentColor" : "none"} />
            <span className="text-sm">{isCompleted ? "Completed" : "Mark as Done"}</span>
          </button>

          <div className="relative">
            {taskDueDate ? (
              <button 
                className="flex items-center gap-1 text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity ease-in-out hover:text-gray-200"
                onClick={toggleDatePicker}
              >
                <Calendar size={14} />
                <span className="text-sm">{format(taskDueDate, "dd MMM, yyyy")}</span>
              </button>
            ) : (
              <button 
                className="flex items-center gap-1 text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity ease-in-out hover:text-gray-200"
                onClick={toggleDatePicker}
              >
                <Calendar size={14} />
                <Plus size={14} />
                <span className="text-sm">Add due date</span>
              </button>
            )}
            
            {showDatePicker && (
              <div 
                ref={datePickerRef}
                className="absolute bottom-full right-0 mb-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <ModernDatePicker 
                  selectedDate={taskDueDate} 
                  onChange={handleDueDateChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Card;