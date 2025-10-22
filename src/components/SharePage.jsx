import React, { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

const SharePage = () => {
  const [castInfo, setCastInfo] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        console.log("📤 Share Extension aktif");

        // SDK context'i al
        const context = await sdk.context;

        // Kullanıcı cast paylaşarak mı geldi?
        if (context?.location?.type === "cast_share") {
          console.log("Paylaşılan cast:", context.location.cast);
          setCastInfo(context.location.cast);
        } else {
          console.log("Normal sayfa açılışı (cast paylaşımı değil)");
        }
      } catch (err) {
        console.error("SharePage hatası:", err);
      }
    };
    init();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900 text-white px-6 text-center">
      <h1 className="text-3xl font-extrabold mb-3">📤 Airdrop Hunter Share</h1>

      {castInfo ? (
        <>
          <p className="text-lg mb-2">Cast bilgisi alındı ✅</p>
          <p className="text-sm text-gray-300 break-words">
            <strong>FID:</strong> {castInfo.fid} <br />
            <strong>Hash:</strong> {castInfo.hash}
          </p>
        </>
      ) : (
        <p className="text-gray-300">
          Bu sayfa, paylaşılan cast bilgilerini göstermek için kullanılır.  
          Şu an doğrudan erişimdesin (cast paylaşımı ile gelmedin).
        </p>
      )}
    </div>
  );
};

export default SharePage;
