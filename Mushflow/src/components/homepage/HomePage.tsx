import React from 'react'
import HeaderComponent from '../Header/header'
import CardBox from '../cardbox/CardBox'

function HomePage() {
  return (
    <div className='min-h-screen bg-neutral-900'>
      <HeaderComponent/>
      <CardBox/>
    </div>
  )
}

export default HomePage