import React from "react";
import { motion } from "framer-motion";

const StartGame = ({ setIsGameStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
      {/* Başlık */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold mb-8 drop-shadow-lg"
      >
        🎯 Target Master
      </motion.h1>

      {/* Açıklama */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-lg mb-12 text-gray-300 text-center max-w-md"
      >
        Tepki süreni test et!  
        Hedefleri olabildiğince hızlı vur ve en yüksek skoru yakala 💥
      </motion.p>

      {/* Start butonu */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsGameStarted(true)}
        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-2xl font-semibold shadow-lg shadow-indigo-500/30 transition-all"
      >
        🚀 Başla
      </motion.button>
    </div>
  );
};

export default StartGame;
