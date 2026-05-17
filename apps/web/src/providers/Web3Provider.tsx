"use client";

import { type ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected({ target: "metaMask" }),
    injected(),
  ],
  transports: {
    [avalancheFuji.id]: http(
      process.env.NEXT_PUBLIC_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc"
    ),
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
