import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { sdk } from "@farcaster/miniapp-sdk";

const TOTAL_BOXES = 20;
const MAX_HITS = 20;
const ACTIVATE_EVERY_MS = 700;
const ACTIVE_LIFETIME_MS = 600;

export default function Shooting() {
  const [targets, setTargets] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // ✅ Farcaster SDK ready (splash ekran hatası çözümü)
  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        console.log("✅ Farcaster MiniApp ready!");
      } catch (err) {
        console.error("SDK ready hatası:", err);
      }
    };
    init();
  }, []);

  // Oyunu sıfırla
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
  };

  useEffect(() => {
    resetGame();
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // Rastgele hedefler
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

        // yeni hedef seç
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

          // hedef belli süre sonra söner
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

  // Hedef vurulunca
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

  // 🎯 CAST YOUR SCORE
const handleCast = async () => {
  const text = `💥 Airdrop Hunter'da ${score} puan yaptım! 🚀
Benim skorumu geçebilir misin? 🎯`;

  const imageUrl = "https://farcaster-mini-app-kappa.vercel.app/Logo.png";
  const appUrl = "https://farcaster-mini-app-kappa.vercel.app/";

  try {
    // 🔗 Warpcast composer bağlantısı: text + görsel + oyun linki
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      text
    )}&embeds[]=${encodeURIComponent(imageUrl)}&embeds[]=${encodeURIComponent(appUrl)}`;

    // Farcaster içindeyse SDK ile aç
    if (sdk?.actions?.openUrl) {
      await sdk.actions.openUrl({ url: warpcastUrl });
      console.log("✅ Cast composer açıldı (SDK ile)");
    } else {
      // Browser fallback
      window.open(warpcastUrl, "_blank");
      console.log("🌐 Tarayıcı composer açıldı (fallback)");
    }
  } catch (err) {
    console.error("Cast hatası:", err);
    setErrorMsg("Cast işlemi başarısız oldu 😅");
  }
};



  // 🪙 MINT SCORE
  const handleMint = async () => {
    try {
      await sdk.actions.openUrl("https://mint.fun/");
    } catch (err) {
      console.error("Mint hatası:", err);
      alert("Mint işlemi başarısız oldu 😅");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-3 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 text-white">
      <h1 className="text-3xl font-extrabold mb-2">💥 Airdrop Hunter</h1>
      <p className="text-lg mb-2">
        Skor: <span className="text-yellow-400 font-semibold">{score}</span>
      </p>
      {/* <p className="text-sm text-gray-300 mb-6">
        🎯 Kalan Hak: {MAX_HITS - tries}
      </p> */}

      {/* 🎮 Oyun Alanı */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 bg-black/40 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md mx-auto">
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
              boxShadow: box.active ? "0 0 22px #fbbf24" : "0 0 0px transparent",
            }}
            transition={{ duration: 0.2 }}
            className="w-20 h-20 rounded-xl cursor-pointer"
          />
        ))}
      </div>

      {/* 🏁 Oyun Sonu */}
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

          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
          >
            🔁 Yeniden Başlat
          </button>
        </div>
      )}

      {!gameOver && (
        <p className="mt-6 text-sm text-gray-300 text-center">
          🔥 20 deneme hakkın var. Vuramazsan da hak gider.
        </p>
      )}
    </div>
  );
}
