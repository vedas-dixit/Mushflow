"use client";

import React, { useState, useEffect, useCallback } from 'react'
import { DynamicHeader, useHeader } from '../Header/header'
import CardBox from '../cardbox/CardBox'
import TaskAddBar from '../taskaddbar/TaskAddBar'
import Whiteboard from '../DrawingBoard/Tldraw'
import JamPage from '../jam/JamPage'
import { Task } from '@/types/Task'
import TaskFilter from '../taskfilter/TaskFilter'
import { Search, X } from 'lucide-react'

interface HomePageProps {
  tasks: Task[];
}

function HomePage({ tasks: initialTasks }: HomePageProps) {
  // Keep a local copy of all tasks that we can update
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [displayedTasks, setDisplayedTasks] = useState<Task[]>(initialTasks);
  const { activeNavId, searchQuery, setSearchQuery } = useHeader();

  // Update filtered tasks whenever activeNavId, allTasks, or searchQuery changes
  useEffect(() => {
    let newFilteredTasks: Task[];
    
    // First filter by navigation section
    if (activeNavId === 'pinned') {
      newFilteredTasks = allTasks.filter(task => task.pinned);
    } else if (activeNavId === 'notes') {
      newFilteredTasks = allTasks;
    } else {
      newFilteredTasks = allTasks;
    }
    
    // Then apply search query filter if there is one
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      newFilteredTasks = newFilteredTasks.filter(task => {
        // Search in title (which should be a string)
        if (typeof task.title === 'string' && task.title.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in content based on its type
        if (typeof task.content === 'string' && task.content.toLowerCase().includes(query)) {
          return true;
        } else if (Array.isArray(task.content)) {
          // If content is an array, search through each item
          return task.content.some(item => {
            if (typeof item === 'string') {
              return item.toLowerCase().includes(query);
            } else if (item && typeof item === 'object') {
              // If array contains objects, search through object values
              return Object.values(item).some(value => 
                typeof value === 'string' && value.toLowerCase().includes(query)
              );
            }
            return false;
          });
        } else if (task.content && typeof task.content === 'object') {
          // If content is an object, search through its values
          return Object.values(task.content).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(query)
          );
        }
        
        // Search in labels
        if (Array.isArray(task.labels) && task.labels.some(label => 
          typeof label === 'string' && label.toLowerCase().includes(query))
        ) {
          return true;
        }
        
        // Search by priority
        if (typeof task.priority === 'string' && task.priority.toLowerCase().includes(query)) {
          return true;
        }
        
        return false;
      });
    }
    
    setFilteredTasks(newFilteredTasks);
    // Immediately update displayedTasks to prevent flash of unfiltered content
    setDisplayedTasks(newFilteredTasks);
  }, [activeNavId, allTasks, searchQuery]);

  // Update allTasks when initialTasks changes (e.g., from server)
  useEffect(() => {
    setAllTasks(initialTasks);
  }, [initialTasks]);

  // Handle task updates from any view
  const handleTaskUpdate = (updatedTask: Task) => {
    setAllTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  // Handle task deletion from any view
  const handleTaskDelete = (taskId: string) => {
    setAllTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // Handle adding a new task
  const handleTaskAdd = (newTask: Task) => {
    setAllTasks(prevTasks => [newTask, ...prevTasks]);
  };

  // Handle filter changes - memoized to prevent infinite loops
  const handleFilterChange = useCallback((filteredResults: Task[]) => {
    setDisplayedTasks(filteredResults);
  }, []);

  return (
    <div className='min-h-screen bg-neutral-900 pb-16 md:pb-0'>
      <DynamicHeader/>
      
      {/* Only show TaskFilter when in notes or pinned view */}
      {(activeNavId === 'notes' || activeNavId === 'pinned') && (
        <TaskFilter 
          tasks={filteredTasks} 
          onFilterChange={handleFilterChange} 
        />
      )}
      
      {activeNavId === 'notes' && (
        <>
          <TaskAddBar onTaskAdd={handleTaskAdd} />
          <div className="w-full px-4 md:pl-16 mt-28"></div>
          {searchQuery.trim() && (
            <div className="w-full px-4 md:pl-16 mb-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-lg ${displayedTasks.length > 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'} text-sm`}>
                {displayedTasks.length > 0 ? (
                  <>
                    <Search className="w-3 h-3 mr-1.5" />
                    Found {displayedTasks.length} {displayedTasks.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
                  </>
                ) : (
                  <>
                    <Search className="w-3 h-3 mr-1.5" />
                    No results found for &quot;{searchQuery}&quot;
                  </>
                )}
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="ml-2 p-0.5 hover:bg-neutral-700/50 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          <CardBox 
            tasks={displayedTasks} 
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </>
      )}
      
      {activeNavId === 'pinned' && (
        <>
          <TaskAddBar onTaskAdd={handleTaskAdd} />
          <div className="w-full px-4 md:pl-16 mt-28"></div>
          {searchQuery.trim() && (
            <div className="w-full px-4 md:pl-16 mb-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-lg ${displayedTasks.length > 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'} text-sm`}>
                {displayedTasks.length > 0 ? (
                  <>
                    <Search className="w-3 h-3 mr-1.5" />
                    Found {displayedTasks.length} {displayedTasks.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
                  </>
                ) : (
                  <>
                    <Search className="w-3 h-3 mr-1.5" />
                    No results found for &quot;{searchQuery}&quot;
                  </>
                )}
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="ml-2 p-0.5 hover:bg-neutral-700/50 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          <CardBox 
            tasks={displayedTasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </>
      )}
      
      {activeNavId === 'jam' && (
        <JamPage />
      )}

      {/* Show Whiteboard in all views except JAM */}
      {activeNavId !== 'jam' && (
        <div className="mt-16 pl-4 md:pl-16">
          <Whiteboard/>
        </div>
      )}
    </div>
  )
}

export default HomePage