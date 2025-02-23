import React from 'react'
import HeaderComponent from '../Header/header'
import CardBox from '../cardbox/CardBox'
import TaskAddBar from '../taskaddbar/TaskAddBar'
import Whiteboard from '../DrawingBoard/Tldraw'

function HomePage() {
  return (
    <div className='min-h-screen bg-neutral-900'>
      <HeaderComponent/>
      <TaskAddBar/>
      <CardBox/>
      <Whiteboard/>
    </div>
  )
}

export default HomePage