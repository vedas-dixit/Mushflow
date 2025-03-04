"use client";
import React, { useEffect, useState, useRef } from "react";
import { Pin, CheckCircle, Calendar, X, Flag, Tag } from "lucide-react";
import { format } from "date-fns";
import { Task, TaskPriority } from "@/types/Task";

interface CardProps {
  title: string;
  content: string;
  priority: TaskPriority;
  color?: string;
  pinned: boolean;
  completed: boolean;
  dueDate: string | null;
  labels?: string[];
}

// Predefined labels (should match those in TaskAddBar)
const predefinedLabels = [
  { id: 'work', name: 'Work', color: '#4285F4' },
  { id: 'personal', name: 'Personal', color: '#EA4335' },
  { id: 'important', name: 'Important', color: '#FBBC05' },
  { id: 'urgent', name: 'Urgent', color: '#FF5252' },
  { id: 'health', name: 'Health', color: '#34A853' },
  { id: 'finance', name: 'Finance', color: '#8E24AA' },
  { id: 'learning', name: 'Learning', color: '#00ACC1' },
  { id: 'family', name: 'Family', color: '#FF6D00' },
];

function Card({ title, content, priority = 'low', color = 'bg-neutral-800', pinned, completed, dueDate, labels = [] }: CardProps) {
  const [isPinned, setIsPinned] = useState(pinned);
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(typeof content === 'string' ? content.split('\n') : content);
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setIsExpanded(false);
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
              onChange={(e) => setEditedTitle(e.target.value)}
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
              onClick={(e) => {
                e.stopPropagation();
                setIsPinned(!isPinned);
              }}
            >
              <Pin fill={isPinned ? "currentColor" : "none"} />
            </button>
            {isExpanded && (
              <button
                className="text-gray-400 hover:text-gray-200"
                onClick={handleClose}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Priority indicator */}
        <div className="flex items-center mt-2 mb-3">
          <Flag size={14} className={`${getPriorityColor(priority)} mr-1`} />
          <span className={`text-xs ${getPriorityColor(priority)}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </span>
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
            onClick={(e) => {
              e.stopPropagation();
              setIsCompleted(!isCompleted);
            }}
          >
            <CheckCircle fill={isCompleted ? "currentColor" : "none"} />
            <span className="text-sm">{isCompleted ? "Completed" : "Mark as Done"}</span>
          </button>

          {dueDate && (
            <div className="flex items-center gap-1 text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity ease-in-out">
              <Calendar size={14} />
              <span className="text-sm">{format(new Date(dueDate), "dd MMM, yyyy")}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Card;