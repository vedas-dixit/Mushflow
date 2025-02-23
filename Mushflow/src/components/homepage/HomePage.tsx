import React from 'react'
import HeaderComponent from '../Header/header'
import CardBox from '../cardbox/CardBox'
import TaskAddBar from '../taskaddbar/TaskAddBar'

function HomePage() {
  return (
    <div className='min-h-screen bg-neutral-900'>
      <HeaderComponent/>
      <TaskAddBar/>
      <CardBox/>
    </div>
  )
}

export default HomePage