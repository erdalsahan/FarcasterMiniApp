// wagmiConfig.js
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { sdk } from "@farcaster/miniapp-sdk";

// 🔮 Farcaster provider setup
let farcasterProvider = null;

(async () => {
  try {
    farcasterProvider = await sdk.wallet.getEthereumProvider();
    console.log("✅ Farcaster provider yüklendi:", farcasterProvider);
  } catch (err) {
    console.warn("⚠️ Farcaster provider alınamadı:", err);
  }
})();

// 🔗 Custom Farcaster connector (wagmi formatında fonksiyon olarak)
function farcasterConnector() {
  return {
    id: "farcaster",
    name: "Farcaster Wallet",
    type: "injected",
    icon: "🟣",
    getProvider: () => farcasterProvider || window.ethereum,
    // wagmi'nin beklediği interface
    async connect() {
      const provider = farcasterProvider || window.ethereum;
      if (!provider) throw new Error("Farcaster provider bulunamadı");
      await provider.request({ method: "eth_requestAccounts" });
      return {
        account: (await provider.request({ method: "eth_accounts" }))[0],
        chain: { id: 8453, unsupported: false },
        provider,
      };
    },
    async disconnect() {
      return true;
    },
    async getAccount() {
      const provider = farcasterProvider || window.ethereum;
      if (!provider) throw new Error("Provider bulunamadı");
      const accounts = await provider.request({ method: "eth_accounts" });
      return accounts[0];
    },
    async getChainId() {
      return 8453; // Base mainnet ID
    },
    async switchChain() {
      throw new Error("Zincir değiştirme desteklenmiyor");
    },
  };
}

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  connectors: [
    farcasterConnector, // ✅ artık fonksiyon
    injected({ shimDisconnect: false }), // 🦊 MetaMask
    coinbaseWallet({
      appName: "Airdrop Hunter",
      appLogoUrl: "https://farcaster-mini-app-kappa.vercel.app/Logo.png",
    }),
  ],
});
