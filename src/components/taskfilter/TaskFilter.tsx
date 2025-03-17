"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, X, Tag, Calendar, Flag, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PredefinedLabels } from '@/utils/predefinedLabels';
import { TaskPriority, Task } from '@/types/Task';

interface TaskFilterProps {
  tasks: Task[];
  onFilterChange: (filteredTasks: Task[]) => void;
}

type SortDirection = 'asc' | 'desc';
type SortField = 'dueDate' | 'createdAt' | 'priority' | 'none';

function TaskFilter({ tasks, onFilterChange }: TaskFilterProps) {
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showLabelsMenu, setShowLabelsMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Refs for click outside detection
  const filterRef = useRef<HTMLDivElement>(null);
  const labelsMenuRef = useRef<HTMLDivElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  
  // Apply filters and sorting to tasks
  useEffect(() => {
    let filteredResults = [...tasks];
    
    // Filter by labels if any are selected
    if (selectedLabels.length > 0) {
      filteredResults = filteredResults.filter(task => 
        task.labels.some(label => selectedLabels.includes(label))
      );
    }
    
    // Filter by priorities if any are selected
    if (selectedPriorities.length > 0) {
      filteredResults = filteredResults.filter(task => 
        selectedPriorities.includes(task.priority)
      );
    }
    
    // Sort the results
    if (sortField !== 'none') {
      filteredResults.sort((a, b) => {
        let comparison = 0;
        
        if (sortField === 'dueDate') {
          // Handle null due dates (null values should come last)
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } 
        else if (sortField === 'createdAt') {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = aTime - bTime;
        }
        else if (sortField === 'priority') {
          // Convert priority to numeric value for comparison
          const priorityValue = {
            'high': 3,
            'medium': 2,
            'low': 1
          };
          
          comparison = 
            (priorityValue[a.priority] || 0) - 
            (priorityValue[b.priority] || 0);
        }
        
        // Reverse the comparison if sorting in descending order
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }
    
    // Update the parent component with filtered tasks
    onFilterChange(filteredResults);
  }, [tasks, selectedLabels, selectedPriorities, sortField, sortDirection, onFilterChange]);
  
  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close labels menu when clicking outside
      if (labelsMenuRef.current && !labelsMenuRef.current.contains(event.target as Node)) {
        setShowLabelsMenu(false);
      }
      
      // Close priority menu when clicking outside
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(event.target as Node)) {
        setShowPriorityMenu(false);
      }
      
      // Close sort menu when clicking outside
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
      
      // Close filter panel when clicking outside
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle label selection
  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };
  
  // Toggle priority selection
  const togglePriority = (priority: TaskPriority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };
  
  // Set sort field and direction
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if the same field is selected
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending (newest first)
      setSortField(field);
      setSortDirection('desc');
    }
    setShowSortMenu(false);
  };
  
  // Toggle menu visibility with stopPropagation
  const toggleLabelsMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLabelsMenu(!showLabelsMenu);
    setShowPriorityMenu(false);
    setShowSortMenu(false);
  };

  const togglePriorityMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPriorityMenu(!showPriorityMenu);
    setShowLabelsMenu(false);
    setShowSortMenu(false);
  };

  const toggleSortMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSortMenu(!showSortMenu);
    setShowLabelsMenu(false);
    setShowPriorityMenu(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedLabels([]);
    setSelectedPriorities([]);
    setSortField('none');
    setSortDirection('desc');
  };
  
  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-green-500';
    }
  };
  
  // Get sort icon based on current sort field and direction
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronDown size={14} />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };
  
  return (
    <div className="fixed z-[1] top-20 right-8 md:right-20">
      <div className="relative">
        {/* Filter Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center px-3 py-2 rounded-lg bg-neutral-800 shadow-lg ${isFilterOpen ? 'text-white' : 'text-neutral-400 hover:text-white'} transition-colors`}
          aria-label="Filter tasks"
        >
          <Filter size={16} className="mr-2" />
          <span>Filter</span>
          {(selectedLabels.length > 0 || selectedPriorities.length > 0 || sortField !== 'none') && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedLabels.length + selectedPriorities.length + (sortField !== 'none' ? 1 : 0)}
            </span>
          )}
        </button>
        
        {/* Filter Panel */}
        {isFilterOpen && (
          <div 
            ref={filterRef}
            className="absolute top-full mt-2 right-0 bg-neutral-800 rounded-lg shadow-lg p-4 w-72 max-h-[80vh] overflow-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Filters</h3>
              {(selectedLabels.length > 0 || selectedPriorities.length > 0 || sortField !== 'none') && (
                <button 
                  onClick={clearFilters}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {/* Labels Filter */}
            <div className="mb-4">
              <div className="relative">
                <div
                  onClick={toggleLabelsMenu}
                  className="flex items-center justify-between w-full px-3 py-2 bg-neutral-700 rounded-md text-white cursor-pointer"
                >
                  <div className="flex items-center">
                    <Tag size={14} className="mr-2" />
                    <span>Labels</span>
                    {selectedLabels.length > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {selectedLabels.length}
                      </span>
                    )}
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform ${showLabelsMenu ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>
              
              {/* Labels Menu - Displayed directly in the panel instead of as a dropdown */}
              {showLabelsMenu && (
                <div 
                  ref={labelsMenuRef}
                  className="mt-2 bg-neutral-700 rounded-md shadow-inner p-2 w-full max-h-60 overflow-y-auto"
                >
                  {PredefinedLabels.map(label => (
                    <button 
                      key={label.id}
                      className={`flex items-center w-full px-2 py-1.5 hover:bg-neutral-600 rounded mb-1 ${selectedLabels.includes(label.id) ? 'bg-neutral-600' : ''}`}
                      onClick={(e) => toggleLabel(label.id)}
                      style={{ color: label.color }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: label.color }}
                      ></div>
                      {label.name}
                      {selectedLabels.includes(label.id) && (
                        <X size={14} className="ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Selected Labels Display */}
              {selectedLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedLabels.map(labelId => {
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
                          onClick={(e) => toggleLabel(label.id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Priority Filter */}
            <div className="mb-4">
              <div className="relative">
                <div
                  onClick={togglePriorityMenu}
                  className="flex items-center justify-between w-full px-3 py-2 bg-neutral-700 rounded-md text-white cursor-pointer"
                >
                  <div className="flex items-center">
                    <Flag size={14} className="mr-2" />
                    <span>Priority</span>
                    {selectedPriorities.length > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {selectedPriorities.length}
                      </span>
                    )}
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform ${showPriorityMenu ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>
              
              {/* Priority Menu - Displayed directly in the panel instead of as a dropdown */}
              {showPriorityMenu && (
                <div 
                  ref={priorityMenuRef}
                  className="mt-2 bg-neutral-700 rounded-md shadow-inner p-2 w-full"
                >
                  <button 
                    className={`flex items-center w-full px-2 py-1.5 text-red-500 hover:bg-neutral-600 rounded mb-1 ${selectedPriorities.includes('high') ? 'bg-neutral-600' : ''}`}
                    onClick={(e) => togglePriority('high')}
                  >
                    <Flag size={14} className="mr-2" />
                    High
                    {selectedPriorities.includes('high') && (
                      <X size={14} className="ml-auto" />
                    )}
                  </button>
                  <button 
                    className={`flex items-center w-full px-2 py-1.5 text-yellow-500 hover:bg-neutral-600 rounded mb-1 ${selectedPriorities.includes('medium') ? 'bg-neutral-600' : ''}`}
                    onClick={(e) => togglePriority('medium')}
                  >
                    <Flag size={14} className="mr-2" />
                    Medium
                    {selectedPriorities.includes('medium') && (
                      <X size={14} className="ml-auto" />
                    )}
                  </button>
                  <button 
                    className={`flex items-center w-full px-2 py-1.5 text-green-500 hover:bg-neutral-600 rounded ${selectedPriorities.includes('low') ? 'bg-neutral-600' : ''}`}
                    onClick={(e) => togglePriority('low')}
                  >
                    <Flag size={14} className="mr-2" />
                    Low
                    {selectedPriorities.includes('low') && (
                      <X size={14} className="ml-auto" />
                    )}
                  </button>
                </div>
              )}
              
              {/* Selected Priorities Display */}
              {selectedPriorities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedPriorities.map(priority => (
                    <div 
                      key={priority} 
                      className={`flex items-center rounded px-2 py-0.5 text-xs ${getPriorityColor(priority)} bg-opacity-20 bg-neutral-600`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      <button 
                        className="ml-1 hover:text-white"
                        onClick={(e) => togglePriority(priority)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Sort Options */}
            <div>
              <div className="relative">
                <div
                  onClick={toggleSortMenu}
                  className="flex items-center justify-between w-full px-3 py-2 bg-neutral-700 rounded-md text-white cursor-pointer"
                >
                  <div className="flex items-center">
                    <ArrowUpDown size={14} className="mr-2" />
                    <span>Sort by</span>
                    {sortField !== 'none' && (
                      <span className="ml-2 text-blue-400 text-xs">
                        {sortField === 'dueDate' ? 'Due Date' : 
                         sortField === 'createdAt' ? 'Date Created' : 
                         sortField === 'priority' ? 'Priority' : ''}
                      </span>
                    )}
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>
              
              {/* Sort Menu - Displayed directly in the panel instead of as a dropdown */}
              {showSortMenu && (
                <div 
                  ref={sortMenuRef}
                  className="mt-2 bg-neutral-700 rounded-md shadow-inner p-2 w-full"
                >
                  <button 
                    className={`flex items-center justify-between w-full px-2 py-1.5 hover:bg-neutral-600 rounded mb-1 ${sortField === 'dueDate' ? 'text-blue-400' : 'text-white'}`}
                    onClick={(e) => handleSort('dueDate')}
                  >
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      Due Date
                    </div>
                    {getSortIcon('dueDate')}
                  </button>
                  <button 
                    className={`flex items-center justify-between w-full px-2 py-1.5 hover:bg-neutral-600 rounded mb-1 ${sortField === 'createdAt' ? 'text-blue-400' : 'text-white'}`}
                    onClick={(e) => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      Date Created
                    </div>
                    {getSortIcon('createdAt')}
                  </button>
                  <button 
                    className={`flex items-center justify-between w-full px-2 py-1.5 hover:bg-neutral-600 rounded ${sortField === 'priority' ? 'text-blue-400' : 'text-white'}`}
                    onClick={(e) => handleSort('priority')}
                  >
                    <div className="flex items-center">
                      <Flag size={14} className="mr-2" />
                      Priority
                    </div>
                    {getSortIcon('priority')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskFilter; 