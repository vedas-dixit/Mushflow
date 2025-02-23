"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Image, Undo, Redo, X, Pin, Calendar } from 'lucide-react';
import { PlaceholderText } from '@/utils/Placeholdertext';

function TaskAddBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const [placeholder, setPlaceholder] = useState(PlaceholderText[0]);

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

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
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

  const handleKeyDown = (e) => {
    adjustTextareaHeight();
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTitle('');
    setNote('');
  };

  return (
    <div className="fixed z-40 top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
      <div 
        ref={containerRef}
        className={`bg-neutral-800 rounded-lg shadow-lg transition-all duration-200 ${
          isExpanded ? 'p-4' : 'p-2'
        }`}
      >
        <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'h-auto opacity-100 mb-2' : 'h-0 opacity-0'}`}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-400 text-lg outline-none"
          />
        </div>
        
        <div className="flex items-start">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onClick={() => setIsExpanded(true)}
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
            <div className="flex space-x-2 text-gray-400">
              <button className="p-2 hover:bg-neutral-700 rounded-full">
                <Calendar size={18} />
              </button>
              <button className="p-2 hover:bg-neutral-700 rounded-full">
                <Image size={18} />
              </button>
              <button className="p-2 hover:bg-neutral-700 rounded-full">
                <Pin size={18} />
              </button>
              <button className="p-2 hover:bg-neutral-700 rounded-full">
                <Undo size={18} />
              </button>
              <button className="p-2 hover:bg-neutral-700 rounded-full">
                <Redo size={18} />
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