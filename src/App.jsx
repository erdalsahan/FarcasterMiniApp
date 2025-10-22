import { useState, useEffect } from 'react'
import './App.css'
import { sdk } from "@farcaster/miniapp-sdk";
import StartGame from './components/StartGame'
import Shooting from './components/Shooting'
function App() {
  const [isGameStarted, setIsGameStarted] = useState(false)
    useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready(); // ✅ Farcaster'a "hazırım" sinyali gönderir
        console.log("Mini app ready ✅");
      } catch (err) {
        console.error("SDK ready hatası:", err);
      }
    };

    init();
  }, []);
  return (
    <>
      {!isGameStarted && <StartGame  setIsGameStarted={setIsGameStarted}/>}
      {isGameStarted && <Shooting/>}
    </>
  )
}

export default App
