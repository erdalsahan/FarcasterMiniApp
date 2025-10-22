import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { sdk } from "@farcaster/miniapp-sdk";
import { ethers } from "ethers";

const TOTAL_BOXES = 20;
const MAX_HITS = 20;
const ACTIVATE_EVERY_MS = 700;
const ACTIVE_LIFETIME_MS = 600;

const CONTRACT_ADDRESS = "0x0DD40377cC1841b3e1aE695B015Cd82883b35390";
const ABI = [
  {
    inputs: [{ internalType: "uint256", name: "score", type: "uint256" }],
    name: "mintScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function Shooting() {
  const [targets, setTargets] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState(null);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

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

  // 🔄 Oyunu sıfırla
  const resetGame = () => {
    setTargets(
      Array.from({ length: TOTAL_BOXES }, (_, i) => ({
        id: i,
        active: false,
        hit: false,
      }))
    );
    setActiveIndex(null);
    setScore(0);
    setTries(0);
    setGameOver(false);
    setIsRunning(true);
    setErrorMsg("");
    setTxHash(null);
  };

  useEffect(() => {
    resetGame();
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // 🎯 Hedefleri sırayla aktif et
  useEffect(() => {
    if (!isRunning || gameOver || targets.length === 0) return;

    intervalRef.current = setInterval(() => {
      setTries((prev) => {
        const next = prev + 1;
        if (next > MAX_HITS) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setGameOver(true);
          setActiveIndex(null);
          return prev;
        }

        setTargets((prevTargets) => {
          const available = prevTargets.filter((b) => !b.hit);
          if (available.length === 0) return prevTargets;

          let nextTargets = prevTargets.map((b) => ({ ...b, active: false }));
          const randomBox =
            available[Math.floor(Math.random() * available.length)];

          nextTargets = nextTargets.map((b) =>
            b.id === randomBox.id ? { ...b, active: true } : b
          );

          setActiveIndex(randomBox.id);

          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setTargets((t2) =>
              t2.map((b) =>
                b.id === randomBox.id ? { ...b, active: false } : b
              )
            );
            setActiveIndex(null);
          }, ACTIVE_LIFETIME_MS);

          return nextTargets;
        });

        return next;
      });
    }, ACTIVATE_EVERY_MS);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, gameOver, targets.length]);

  const handleHit = (id) => {
    if (id !== activeIndex || gameOver) return;
    clearTimeout(timeoutRef.current);
    setScore((s) => s + 10);
    setActiveIndex(null);

    setTargets((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, hit: true, active: false } : b
      )
    );
  };

  // 🎯 CAST işlemi
  const handleCast = async () => {
    const text = `💥 Airdrop Hunter'da ${score} puan yaptım! 🚀\nBenim skorumu geçebilir misin? 🎯`;
    const appUrl = "https://farcaster.xyz/miniapps/QBCgeq4Db7Wx/airdrop-hunter";

    try {
      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
        text
      )}&embeds[]=${encodeURIComponent(appUrl)}`;
      await sdk.actions.openUrl({ url: warpcastUrl });
      console.log("✅ Cast composer açıldı");
    } catch (err) {
      console.error("Cast hatası:", err);
      setErrorMsg("Cast işlemi başarısız oldu 😅");
    }
  };

  // 🪙 Sadece Farcaster Wallet ile mint işlemi
  const handleMint = async () => {
    try {
      console.log("🪙 Mint işlemi başlatılıyor (Farcaster Wallet)...");

      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) {
        setErrorMsg("⚠️ Farcaster Wallet bulunamadı 😕");
        return;
      }

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.mintScore(score);
      await tx.wait();

      console.log("✅ Mint başarılı! Tx:", tx.hash);
      setTxHash(tx.hash);
    } catch (err) {
      console.error("Mint hatası:", err);
      setErrorMsg("Mint işlemi başarısız oldu 😅");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-3 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 text-white">
      <h1 className="text-3xl font-extrabold mb-2">💥 Airdrop Hunter</h1>
      <p className="text-lg mb-2">
        Skor: <span className="text-yellow-400 font-semibold">{score}</span>
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 bg-black/40 p-4 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md mx-auto">
        {targets.map((box) => (
          <motion.div
            key={box.id}
            onClick={() => handleHit(box.id)}
            animate={{
              scale: box.active ? 1.12 : 1,
              backgroundColor: box.hit
                ? "#22c55e"
                : box.active
                ? "#f59e0b"
                : "#374151",
              boxShadow: box.active ? "0 0 22px #fbbf24" : "none",
            }}
            transition={{ duration: 0.2 }}
            className="w-20 h-20 rounded-xl cursor-pointer"
          />
        ))}
      </div>

      {gameOver && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <span className="text-lg font-semibold">
            🎮 Oyun bitti! Skorun: {score}
          </span>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={handleCast}
              className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
            >
              🟣 Cast Your Score
            </button>
            <button
              onClick={handleMint}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition"
            >
              🪙 Mint Score
            </button>
          </div>

          {txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-400 underline mt-2"
            >
              🔗 İşlemi Görüntüle
            </a>
          )}

          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
          >
            🔁 Yeniden Başlat
          </button>

          {errorMsg && (
            <p className="text-red-400 text-sm mt-2 font-medium">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
