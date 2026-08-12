"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { avalancheFuji, avalanche } from "wagmi/chains";

type KumplyNetwork = "fuji" | "mainnet";

/**
 * What each network can actually do. This is not cosmetic: Mainnet C-Chain runs
 * as a read-only beta because identity issuance depends on Sumsub's production
 * tier, which is not activated yet. Keeping the matrix here means the UI can
 * never claim a capability the network does not have.
 */
export interface NetworkCapabilities {
  /** Issue new attestations through the KYC flow. */
  issuance: boolean;
  /** Read attestations — free on both networks. */
  reads: boolean;
  /** ComplianceGate demo checks. */
  demo: boolean;
  /** Attestation explorer / dashboard feed. */
  feed: boolean;
  /** KUMPLY Compliance L1 + ACP-99 validator manager. */
  l1: boolean;
}

export const NETWORK_CAPABILITIES: Record<KumplyNetwork, NetworkCapabilities> = {
  fuji: { issuance: true, reads: true, demo: true, feed: true, l1: true },
  mainnet: { issuance: false, reads: true, demo: true, feed: true, l1: false },
};

const NETWORK_STORAGE_KEY = "kumply.network";

interface KumplyNetworkContextType {
  network: KumplyNetwork;
  /** Requests a switch. Moving to mainnet opens a confirmation dialog first. */
  setNetwork: (network: KumplyNetwork) => void;
  /** Non-null while the mainnet confirmation dialog is open. */
  pendingNetwork: KumplyNetwork | null;
  confirmNetworkSwitch: () => void;
  cancelNetworkSwitch: () => void;
  capabilities: NetworkCapabilities;
  contractAddress: `0x${string}`;
  complianceGateAddress: `0x${string}`;
  rpcUrl: string;
  chainId: number;
}

const KumplyNetworkContext = createContext<KumplyNetworkContextType | undefined>(undefined);

const CONTRACT_STORE_FUJI = "0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD";
const CONTRACT_GATE_FUJI = "0xcFDdeA5482baE9A6733B58F6a39FC36BCe6164cF";

// Placeholders for mainnet. Can be overridden via env vars.
const CONTRACT_STORE_MAINNET = process.env.NEXT_PUBLIC_CONTRACT_ATTESTATION_STORE_MAINNET || "0x0000000000000000000000000000000000000000";
const CONTRACT_GATE_MAINNET = process.env.NEXT_PUBLIC_CONTRACT_COMPLIANCE_GATE_MAINNET || "0x0000000000000000000000000000000000000000";

export function KumplyNetworkProvider({ children }: { children: React.ReactNode }) {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  
  // Stored state for UI/unconnected users. Starts on fuji so server and first
  // client render agree; the persisted choice is applied in the effect below.
  const [network, setNetworkState] = useState<KumplyNetwork>("fuji");

  // Restore the last chosen network. Without this a reload silently drops the
  // user back to Fuji while the page keeps showing mainnet-looking data.
  useEffect(() => {
    const stored = window.localStorage.getItem(NETWORK_STORAGE_KEY);
    if (stored === "mainnet" || stored === "fuji") {
      setNetworkState(stored);
    }
  }, []);

  // Sync state if wallet is connected and on a supported chain
  useEffect(() => {
    if (isConnected && chain) {
      if (chain.id === avalanche.id) {
        setNetworkState("mainnet");
      } else if (chain.id === avalancheFuji.id) {
        setNetworkState("fuji");
      }
    }
  }, [chain, isConnected]);

  const [pendingNetwork, setPendingNetwork] = useState<KumplyNetwork | null>(null);

  const applyNetwork = (newNetwork: KumplyNetwork) => {
    setNetworkState(newNetwork);
    window.localStorage.setItem(NETWORK_STORAGE_KEY, newNetwork);

    // If wallet is connected, switch its network too
    if (isConnected && switchChain) {
      const targetChainId = newNetwork === "mainnet" ? avalanche.id : avalancheFuji.id;
      if (chain?.id !== targetChainId) {
        switchChain({ chainId: targetChainId });
      }
    }
  };

  // Going to mainnet points the whole site at different deployed contracts and
  // silently removes issuance, so it is confirmed. Returning to Fuji is safe
  // and immediate — no dialog.
  const setNetwork = (newNetwork: KumplyNetwork) => {
    if (newNetwork === "mainnet" && network !== "mainnet") {
      setPendingNetwork("mainnet");
      return;
    }
    applyNetwork(newNetwork);
  };

  const confirmNetworkSwitch = () => {
    if (pendingNetwork) applyNetwork(pendingNetwork);
    setPendingNetwork(null);
  };

  const cancelNetworkSwitch = () => setPendingNetwork(null);

  const contractAddress = (network === "mainnet" ? CONTRACT_STORE_MAINNET : CONTRACT_STORE_FUJI) as `0x${string}`;
  const complianceGateAddress = (network === "mainnet" ? CONTRACT_GATE_MAINNET : CONTRACT_GATE_FUJI) as `0x${string}`;
  const rpcUrl = network === "mainnet" 
    ? "https://api.avax.network/ext/bc/C/rpc"
    : "https://api.avax-test.network/ext/bc/C/rpc";
  const chainId = network === "mainnet" ? avalanche.id : avalancheFuji.id;

  return (
    <KumplyNetworkContext.Provider
      value={{
        network,
        setNetwork,
        pendingNetwork,
        confirmNetworkSwitch,
        cancelNetworkSwitch,
        capabilities: NETWORK_CAPABILITIES[network],
        contractAddress,
        complianceGateAddress,
        rpcUrl,
        chainId,
      }}
    >
      {children}
    </KumplyNetworkContext.Provider>
  );
}

export function useKumplyNetwork() {
  const context = useContext(KumplyNetworkContext);
  if (!context) {
    throw new Error("useKumplyNetwork must be used within a KumplyNetworkProvider");
  }
  return context;
}
