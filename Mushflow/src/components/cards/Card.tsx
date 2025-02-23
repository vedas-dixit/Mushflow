"use client";
import React, { useEffect, useState, useRef } from "react";
import { Pin, CheckCircle, Calendar, X } from "lucide-react";
import { format } from "date-fns";

function Card({ title, content, priority, color, pinned, completed, dueDate }: any) {
  const [isPinned, setIsPinned] = useState(pinned);
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
      if (textareaRef.current) {
        adjustTextareaHeight(textareaRef.current);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value.split('\n'));
    adjustTextareaHeight(e.target.target);
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
        } ${color} rounded-lg border border-gray-600 transition-all duration-200 group`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="p-4">
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

          <div className="mt-2 text-gray-300">
            {isExpanded ? (
              <textarea
                ref={textareaRef}
                value={editedContent.join('\n')}
                onChange={handleContentChange}
                className="w-full bg-transparent outline-none resize-none min-h-[100px]"
                placeholder="Add note content..."
              />
            ) : (
              editedContent.map((item: string, index: number) => (
                <p key={index} className="mb-1">• {item}</p>
              ))
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
      </div>
    </>
  );
}

export default Card;