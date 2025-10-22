import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { sdk } from "@farcaster/miniapp-sdk";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../wagmiConfig";
import StartGame from "./components/StartGame";
import Shooting from "./components/Shooting";
import SharePage from "./components/SharePage";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        console.log("✅ Farcaster MiniApp hazır!");
      } catch (err) {
        console.error("SDK ready hatası:", err);
      }
    };
    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StartGame />} />
            <Route path="/game" element={<Shooting />} />
            <Route path="/share" element={<SharePage />} />
          </Routes>
        </BrowserRouter>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
