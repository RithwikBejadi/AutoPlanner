import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  // const [tasks, setTasks] = useState([])

  
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 3000)
  })
  .then(() => {
    console.log("promise resolved")
  })

  return (
    <>
      {promise}
    </>
  )
}

export default App
