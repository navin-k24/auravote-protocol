import React, { createContext, useContext, useState, useEffect } from "react";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment, poseidonHash } from "../crypto/poseidon";
import { laceConnector } from "../midnight/laceConnector";
import { WalletState } from "../midnight/types";

export interface ConnectedVoterProfile {
  address: string;
  name: string;
  balance: number;
  secretKey: string;
  blindingFactor: string;
  commitment: string;
  merkleIndex: number;
  isLaceConnected: boolean;
}

interface WalletContextType {
  isConnected: boolean;
  isLaceInstalled: boolean;
  walletState: WalletState | null;
  selectedAccount: ConnectedVoterProfile | null;
  merkleTree: MerkleTree;
  voterRegistryRoot: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merkleTree, setMerkleTree] = useState<MerkleTree>(() => new MerkleTree(8));
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLaceInstalled, setIsLaceInstalled] = useState<boolean>(false);
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<ConnectedVoterProfile | null>(null);

  // Initialize Merkle tree and check Lace status on mount
  useEffect(() => {
    const tree = new MerkleTree(8);
    const installed = laceConnector.isInstalled();
    setIsLaceInstalled(installed);

    // If Lace is installed, check if previously authorized
    if (installed) {
      laceConnector.checkAuthorization().then((authorized) => {
        if (authorized) {
          connectWallet().catch(() => {});
        }
      });
    }

    setMerkleTree(tree);
  }, []);

  const connectWallet = async () => {
    if (!laceConnector.isInstalled()) {
      throw new Error("Midnight Lace Wallet extension not detected in your browser.");
    }

    try {
      const state = await laceConnector.connect();
      setWalletState(state);
      setIsConnected(true);

      // Generate deterministic client-side witness keys from connected address for confidential ballot casting
      const secretKey = poseidonHash([state.address || "lace_user", "SECRET_KEY_SALT"]);
      const blindingFactor = poseidonHash([state.address || "lace_user", "BLINDING_FACTOR_SALT"]);
      const commitment = createVoterCommitment(secretKey, blindingFactor);

      const tree = new MerkleTree(8);
      const index = tree.insertLeaf(commitment);
      setMerkleTree(tree);

      setSelectedAccount({
        address: state.address || "mn_addr_test1...",
        name: state.activeAccountName,
        balance: state.balance,
        secretKey,
        blindingFactor,
        commitment,
        merkleIndex: index,
        isLaceConnected: true
      });
    } catch (err: any) {
      console.error("Failed to connect Midnight Lace wallet:", err);
      throw err;
    }
  };

  const disconnectWallet = () => {
    laceConnector.disconnect();
    setIsConnected(false);
    setWalletState(null);
    setSelectedAccount(null);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isLaceInstalled,
        walletState,
        selectedAccount,
        merkleTree,
        voterRegistryRoot: merkleTree.getRoot(),
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};