import { useState } from 'react'
import './App.css'
import StartGame from './components/StartGame'
import Shooting from './components/Shooting'
function App() {
  const [isGameStarted, setIsGameStarted] = useState(false)

  return (
    <>
      {!isGameStarted && <StartGame  setIsGameStarted={setIsGameStarted}/>}
      {isGameStarted && <Shooting/>}
    </>
  )
}

export default App
