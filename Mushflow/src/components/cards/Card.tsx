"use client";
import React, { useEffect, useState, useRef } from "react";
import { Pin, CheckCircle, Calendar, X, Flag, Tag, Plus, Trash2, CheckCircle2, Paperclip, Download, Eye, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Task, TaskPriority } from "@/types/Task";
import { predefinedLabels } from "@/utils/predefinedLabels";
import { updateTask, deleteTask } from "@/utils/taskService";
import { useSession } from "next-auth/react";
import ModernDatePicker from "../datepickercomponent/DatePickerComponent";

// Define a simple Attachment type
interface Attachment {
  id: string;
  taskId: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  key: string; // Store the S3 key for deletion
}

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
  attachments?: Attachment[];
  onUpdate?: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void;
}

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
  attachments = [],
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
  const [taskAttachments, setTaskAttachments] = useState<Attachment[]>(attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTruncated, setIsTruncated] = useState(true);
  const MAX_CONTENT_LINES = 6;
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0 });
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  // Debug initial attachments
  useEffect(() => {
    console.log('Initial attachments prop:', attachments);
  }, []);

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

  // Update attachments when props change - CRITICAL for refresh behavior
  useEffect(() => {
    if (attachments && attachments.length > 0) {
      console.log('Updating attachments from props:', attachments);
      setTaskAttachments(attachments);
    }
  }, [attachments]);

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
    
    // Only toggle date picker if card is expanded
    if (isExpanded) {
      setShowDatePicker(!showDatePicker);
    } else {
      // If card is not expanded, expand it first
      setIsExpanded(true);
      // Set a small delay before showing date picker to ensure card is expanded
      setTimeout(() => {
        setShowDatePicker(true);
      }, 100);
    }
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

  // Function to truncate content for display
  const getTruncatedContent = () => {
    if (!Array.isArray(editedContent)) {
      return editedContent;
    }
    
    if (isTruncated && editedContent.length > MAX_CONTENT_LINES) {
      return editedContent.slice(0, MAX_CONTENT_LINES);
    }
    
    return editedContent;
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('taskId', id);
      
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload files');
      }
      
      const data = await response.json();
      const newAttachments = [...taskAttachments, ...data.attachments];
      setTaskAttachments(newAttachments);
      
      // Update the task with new attachments
      updateTaskField('attachments', newAttachments);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle file deletion
  const handleDeleteAttachment = async (attachment: Attachment) => {
    try {
      const response = await fetch(`/api/upload/${attachment.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: attachment.key }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      const updatedAttachments = taskAttachments.filter(att => att.id !== attachment.id);
      setTaskAttachments(updatedAttachments);
      
      // Update the task with new attachments
      updateTaskField('attachments', updatedAttachments);
      
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Get file icon based on content type
  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.startsWith('video/')) return '🎬';
    if (contentType.startsWith('audio/')) return '🎵';
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word') || contentType.includes('document')) return '📝';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
    if (contentType.includes('presentation') || contentType.includes('powerpoint')) return '📽️';
    return '📎';
  };
  
  // Preview file
  const previewFile = (url: string, contentType: string) => {
    if (contentType.startsWith('image/')) {
      window.open(url, '_blank');
    } else if (contentType.startsWith('video/') || contentType.startsWith('audio/') || contentType.includes('pdf')) {
      window.open(url, '_blank');
    } else {
      // For other file types, just download
      downloadFile(url);
    }
  };
  
  // Download file
  const downloadFile = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
            : "relative w-full break-inside-avoid"
        } ${color} rounded-lg border border-gray-600 transition-all duration-200 group p-3`}
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
            <h3 className={`font-medium text-lg text-gray-100 ${isCompleted ? "line-through opacity-60" : ""} truncate`}>
              {editedTitle}
            </h3>
          )}

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              className={`opacity-0 group-hover:opacity-100 transition-opacity ease-in-out ${
                isPinned ? "text-stone-200" : "text-gray-400"
              }`}
              onClick={handlePinToggle}
            >
              <Pin size={16} fill={isPinned ? "currentColor" : "none"} />
            </button>
            {isExpanded && (
              <>
                <button
                  className="text-gray-400 hover:text-red-400"
                  onClick={handleDeleteTask}
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className="text-gray-400 hover:text-gray-200"
                  onClick={handleClose}
                >
                  <X size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Priority indicator with dropdown */}
        <div className="flex items-center mt-1 mb-2 relative">
          <button 
            onClick={togglePriorityMenu}
            className="flex items-center hover:bg-gray-700 rounded px-1.5 py-0.5"
          >
            <Flag size={12} className={`${getPriorityColor(taskPriority)} mr-1`} />
            <span className={`text-xs ${getPriorityColor(taskPriority)}`}>
              {taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}
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
          <div className="flex flex-wrap gap-1 mb-2">
            {labels.map(labelId => {
              const label = predefinedLabels.find(l => l.id === labelId) || { id: labelId, name: labelId, color: '#9E9E9E' };
              return (
                <div 
                  key={label.id} 
                  className="flex items-center bg-opacity-20 rounded px-1.5 py-0.5 text-xs"
                  style={{ backgroundColor: `${label.color}40`, color: label.color }}
                >
                  {label.name}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-1 flex-grow">
          {isExpanded ? (
            <textarea
              ref={textareaRef}
              value={editedContent.join('\n')}
              onChange={handleContentChange}
              className="w-full bg-transparent outline-none resize-none min-h-[100px] text-gray-200"
              placeholder="Add note content..."
            />
          ) : (
            <div className="text-gray-300 text-sm">
              {Array.isArray(editedContent) ? (
                <>
                  {getTruncatedContent().map((item: string, index: number) => (
                    <p key={index} className={`mb-0.5 ${isCompleted ? "line-through opacity-60" : ""}`}>
                      {item}
                    </p>
                  ))}
                  {isTruncated && editedContent.length > MAX_CONTENT_LINES && (
                    <p className="text-gray-400 text-xs">
                      ... {editedContent.length - MAX_CONTENT_LINES} more items
                    </p>
                  )}
                </>
              ) : (
                <p className={`mb-0.5 ${isCompleted ? "line-through opacity-60" : ""}`}>
                  • {editedContent}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Attachments Section */}
        {(taskAttachments.length > 0 || isExpanded) && (
          <div className="mt-2 border-t border-gray-700 pt-2">
            {taskAttachments.length > 0 && (
              <div className="mb-1">
                <h4 className="text-xs text-gray-400 mb-1">Attachments</h4>
                <div className="flex flex-wrap gap-1">
                  {taskAttachments.map(attachment => (
                    <div 
                      key={attachment.id} 
                      className="flex items-center bg-gray-700 bg-opacity-30 rounded-md p-1 text-xs w-full"
                    >
                      <div className="flex items-center space-x-1 overflow-hidden flex-1 min-w-0">
                        <span className="text-base flex-shrink-0">{getFileIcon(attachment.contentType)}</span>
                        <span className="truncate">{attachment.filename}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatFileSize(attachment.size)}</span>
                      </div>
                      
                      <div className="flex space-x-1 flex-shrink-0 ml-1">
                        <button 
                          onClick={() => previewFile(attachment.url, attachment.contentType)}
                          className="p-0.5 text-gray-400 hover:text-blue-400"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => downloadFile(attachment.url)}
                          className="p-0.5 text-gray-400 hover:text-green-400"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        {isExpanded && (
                          <button 
                            onClick={() => handleDeleteAttachment(attachment)}
                            className="p-0.5 text-gray-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isExpanded && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center text-sm text-gray-400 hover:text-gray-200"
                  disabled={isUploading}
                >
                  <Paperclip size={16} className="mr-1" />
                  {isUploading ? 'Uploading...' : 'Attach files'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <button
            className={`flex items-center gap-1 ${
              isCompleted ? "text-green-400" : "text-gray-400"
            }`}
            onClick={handleCompletionToggle}
          >
            <CheckCircle2 fill={isCompleted ? "currentColor" : "none"} size={14}/>
            <span className="text-[10px]">{isCompleted ? "Done" : "Mark Done"}</span>
          </button>

          <div className="relative flex items-center">
            {taskDueDate ? (
              <button 
                onClick={toggleDatePicker}
                className="flex items-center text-xs text-blue-400"
              >
                <Calendar size={14} className="mr-1" />
                {format(new Date(taskDueDate), 'MMM d')}
              </button>
            ) : (
              <button 
                onClick={toggleDatePicker}
                className="flex items-center text-xs text-gray-400 hover:text-gray-200"
              >
                <Calendar size={14} className="mr-1" />
                Add date
              </button>
            )}
            
            {/* Only show date picker when card is expanded */}
            {isExpanded && showDatePicker && (
              <div 
                ref={datePickerRef}
                className="absolute bottom-0 right-0 transform translate-y-full mt-2 z-50"
                onClick={(e) => e.stopPropagation()}
                style={{
                  bottom:"26px",
                  left: -9,
                  maxWidth: "300px"
                }}
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