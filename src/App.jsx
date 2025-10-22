import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { sdk } from "@farcaster/miniapp-sdk";
import { WagmiProvider } from "wagmi";
import { config } from "../wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StartGame from "./components/StartGame";
import Shooting from "./components/Shooting";
import SharePage from "./components/SharePage";
import "./App.css";

// ⚙️ React Query için gerekli client
const queryClient = new QueryClient();

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
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StartGame />} />
            <Route path="/game" element={<Shooting />} />
            <Route path="/share" element={<SharePage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
