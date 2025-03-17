"use client";

import React, { useState, useEffect, useCallback } from 'react'
import { DynamicHeader, useHeader } from '../Header/header'
import CardBox from '../cardbox/CardBox'
import TaskAddBar from '../taskaddbar/TaskAddBar'
import Whiteboard from '../DrawingBoard/Tldraw'
import JamPage from '../jam/JamPage'
import { Task } from '@/types/Task'
import TaskFilter from '../taskfilter/TaskFilter'

interface HomePageProps {
  tasks: Task[];
}

function HomePage({ tasks: initialTasks }: HomePageProps) {
  // Keep a local copy of all tasks that we can update
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [displayedTasks, setDisplayedTasks] = useState<Task[]>(initialTasks);
  const { activeNavId } = useHeader();

  // Update filtered tasks whenever activeNavId or allTasks change
  useEffect(() => {
    let newFilteredTasks: Task[];
    
    if (activeNavId === 'pinned') {
      newFilteredTasks = allTasks.filter(task => task.pinned);
    } else if (activeNavId === 'notes') {
      newFilteredTasks = allTasks;
    } else {
      newFilteredTasks = allTasks;
    }
    
    setFilteredTasks(newFilteredTasks);
    // Immediately update displayedTasks to prevent flash of unfiltered content
    setDisplayedTasks(newFilteredTasks);
  }, [activeNavId, allTasks]);

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