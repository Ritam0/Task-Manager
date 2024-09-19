import React from 'react'
import Login from './Login'
import MyCalander from './Calander'

const Page = () => {
  return (
    <div className='flex flex-col items-center justify-center gap-8 pt-4'>
      <Login/>
        <MyCalander/>
      
    </div>
  )
}

export default Page
