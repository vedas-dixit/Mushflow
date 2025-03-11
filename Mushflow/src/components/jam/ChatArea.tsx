import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'system' | 'join' | 'leave';
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

export default function ChatArea({
  messages,
  onSendMessage,
  currentUserId
}: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
    }
  };
  
  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-700">
        <h2 className="text-lg font-medium text-white">Chat</h2>
      </div>
      
      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {messages.map(message => (
            <div 
              key={message.id}
              className={`
                ${message.type === 'system' ? 'text-neutral-500 text-sm italic' : ''}
                ${message.type === 'join' || message.type === 'leave' ? 'text-neutral-500 text-sm' : ''}
              `}
            >
              {message.type === 'text' && (
                <div className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`
                      max-w-[80%] rounded-lg px-3 py-2
                      ${message.senderId === currentUserId 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-neutral-700 text-white'}
                    `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">
                        {message.senderId === currentUserId ? 'You' : message.senderName}
                      </span>
                      <span className="text-xs opacity-70 ml-2">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p>{message.content}</p>
                  </div>
                </div>
              )}
              
              {message.type === 'system' && (
                <div className="text-center py-1">
                  {message.content}
                </div>
              )}
              
              {(message.type === 'join' || message.type === 'leave') && (
                <div className="text-center py-1">
                  <span className="font-medium">{message.senderName}</span> {message.content}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-neutral-700">
        <div className="flex">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-700 border border-neutral-600 rounded-l-lg py-2 px-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-r-lg px-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
} 