// wagmiConfig.js
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { sdk } from "@farcaster/miniapp-sdk";

let farcasterProvider = null;

// 🟣 Farcaster provider'ı miniapp SDK üzerinden al
(async () => {
  try {
    farcasterProvider = await sdk.wallet.getEthereumProvider();
    console.log("✅ Farcaster provider yüklendi:", farcasterProvider);
  } catch (err) {
    console.log("⚠️ Farcaster provider alınamadı, varsayılan kullanılacak");
  }
})();

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  connectors: [
    // 🟣 Farcaster Wallet (öncelikli)
    {
      id: "farcaster",
      name: "Farcaster Wallet",
      type: "injected",
      getProvider: () => farcasterProvider || window.ethereum,
    },

    // 🦊 MetaMask (fallback)
    injected({
      target: "metaMask",
      shimDisconnect: false,
    }),

    // 🟢 Coinbase Wallet
    coinbaseWallet({
      appName: "Airdrop Hunter",
      appLogoUrl: "https://farcaster-mini-app-kappa.vercel.app/Logo.png",
    }),
  ],
});
