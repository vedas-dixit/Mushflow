import React, { useState, useRef, useEffect } from 'react';
import DatePicker from "react-datepicker";
import { Calendar, X } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
// Fix the import path and case sensitivity
import "../../styles/DatePicker.css";

interface ModernDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  selectedDate,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format date as DD/MM/YY
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="" ref={containerRef}>
      {/* Calendar button */}
      <button 
        className={`p-2 hover:bg-neutral-700 rounded-full ${isOpen ? 'bg-neutral-700' : ''} ${selectedDate ? 'text-blue-400' : 'text-gray-400'}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Calendar size={15} />
      </button>
      
      {/* Calendar dropdown - Add higher z-index and fixed positioning */}
      {isOpen && (
        <div 
        className="absolute z-30"
        style={{ 
          top: '100%',  // Position below the button
          left: '15px',    // Align with left edge of button
          marginTop: '8px'
        }}
      >
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            inline
            calendarClassName="modern-dark-calendar"
            popperClassName="z-30"
          />
        </div>
      )}
      

      {selectedDate && (
        <div className="absolute z-30 text-sm text-gray-300 flex items-center bg-neutral-700/90 px-2 py-1 rounded-md whitespace-nowrap"
        style={{ 
            top: '100%', 
            left: '15px',
            marginTop: '8px'
          }}
        >
          <Calendar size={14} className="mr-1 text-blue-400" />
          <span>{formatDate(selectedDate)}</span>
          <button 
            className="ml-2 text-gray-400 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ModernDatePicker;