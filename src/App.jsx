import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { sdk } from "@farcaster/miniapp-sdk";
import StartGame from "./components/StartGame";
import Shooting from "./components/Shooting";
import SharePage from "./components/SharePage";
import './App.css'
function App() {
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartGame />} />
        <Route path="/game" element={<Shooting />} />
        <Route path="/share" element={<SharePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
