"use client";

import React, { useState, useEffect } from 'react'
import { DynamicHeader, useHeader } from '../Header/header'
import CardBox from '../cardbox/CardBox'
import TaskAddBar from '../taskaddbar/TaskAddBar'
import Whiteboard from '../DrawingBoard/Tldraw'
import { Task } from '@/types/Task'

interface HomePageProps {
  tasks: Task[];
}

function HomePage({ tasks: initialTasks }: HomePageProps) {
  // Keep a local copy of all tasks that we can update
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const { activeNavId } = useHeader();

  // Update filtered tasks whenever activeNavId or allTasks change
  useEffect(() => {
    if (activeNavId === 'pinned') {
      setFilteredTasks(allTasks.filter(task => task.pinned));
    } else if (activeNavId === 'notes') {
      setFilteredTasks(allTasks);
    } else {
      setFilteredTasks(allTasks);
    }
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

  return (
    <div className='min-h-screen bg-neutral-900'>
      <DynamicHeader/>
      
      {activeNavId === 'notes' && (
        <>
          <TaskAddBar onTaskAdd={handleTaskAdd} />
          <CardBox 
            tasks={filteredTasks} 
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </>
      )}
      
      {activeNavId === 'pinned' && (
        <CardBox 
          tasks={filteredTasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      )}
      
      {activeNavId === 'jam' && (
        <div className="mt-16 pl-16">
          <Whiteboard/>
        </div>
      )}

      {/* Show Whiteboard in all views except JAM */}
      {activeNavId !== 'jam' && (
        <div className="mt-16 pl-16">
          <Whiteboard/>
        </div>
      )}
    </div>
  )
}

export default HomePage