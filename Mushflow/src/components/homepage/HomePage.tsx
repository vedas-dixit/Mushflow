"use client";

import React from 'react'
import HeaderComponent from '../Header/header'
import CardBox from '../cardbox/CardBox'
import TaskAddBar from '../taskaddbar/TaskAddBar'
import Whiteboard from '../DrawingBoard/Tldraw'
import { Task } from '@/types/Task'

interface HomePageProps {
  tasks: Task[];
}

function HomePage({ tasks }: HomePageProps) {
  return (
    <div className='min-h-screen bg-neutral-900'>
      <HeaderComponent/>
      <TaskAddBar/>
      <CardBox tasks={tasks}/>
      <Whiteboard/>
    </div>
  )
}

export default HomePage