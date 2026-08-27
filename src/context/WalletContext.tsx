import React, { createContext, useContext, useState, useEffect } from "react";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment, generateSecretKey, poseidonHash } from "../crypto/poseidon";
import { VoterProfile } from "../contracts/types";

// Pre-seeded testnet voter profiles for instant testing & demonstration
const INITIAL_ACCOUNTS: Omit<VoterProfile, "commitment" | "merkleIndex" | "hasVotedOn">[] = [
  {
    name: "Alice (Core Contributor)",
    address: "mn_addr_test1qrx8alice893j2k498fjd9283f9823jf9283jf0a8sd7f098as7df",
    balance: 2450.5,
    secretKey: "0x4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    blindingFactor: "0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00"
  },
  {
    name: "Bob (DAO Delegate)",
    address: "mn_addr_test1qrx8bob9923847293847293847293847293847293847293847293847",
    balance: 1200.0,
    secretKey: "0x5b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    blindingFactor: "0x2233445566778899aabbccddeeff00112233445566778899aabbccddeeff0011"
  },
  {
    name: "Charlie (Security Auditor)",
    address: "mn_addr_test1qrx8charlie398472938472938472938472938472938472938472938",
    balance: 850.75,
    secretKey: "0x6c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
    blindingFactor: "0x33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122"
  },
  {
    name: "Dave (Community Member)",
    address: "mn_addr_test1qrx8dave4829384729384729384729384729384729384729384729384",
    balance: 310.0,
    secretKey: "0x7d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e",
    blindingFactor: "0x445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233"
  },
  {
    name: "Eve (DeFi Researcher)",
    address: "mn_addr_test1qrx8eve58293847293847293847293847293847293847293847293845",
    balance: 560.25,
    secretKey: "0x8e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
    blindingFactor: "0x5566778899aabbccddeeff00112233445566778899aabbccddeeff0011223344"
  }
];

interface WalletContextType {
  isConnected: boolean;
  isLaceInjected: boolean;
  selectedAccount: VoterProfile | null;
  accounts: VoterProfile[];
  merkleTree: MerkleTree;
  voterRegistryRoot: string;
  selectAccount: (index: number) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  requestFaucet: () => void;
  registerNewCredential: (name: string) => VoterProfile;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merkleTree, setMerkleTree] = useState<MerkleTree>(() => new MerkleTree(8));
  const [accounts, setAccounts] = useState<VoterProfile[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<VoterProfile | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLaceInjected, setIsLaceInjected] = useState<boolean>(false);

  useEffect(() => {
    // Check if Midnight Lace Wallet is injected
    if (typeof window !== "undefined" && (window as any).midnight) {
      setIsLaceInjected(true);
    }

    // Initialize Merkle tree with test voter commitments
    const initialTree = new MerkleTree(8);
    const populatedAccounts: VoterProfile[] = INITIAL_ACCOUNTS.map((acc, index) => {
      const commitment = createVoterCommitment(acc.secretKey, acc.blindingFactor);
      initialTree.insertLeaf(commitment);
      return {
        ...acc,
        commitment,
        merkleIndex: index,
        hasVotedOn: {}
      };
    });

    setMerkleTree(initialTree);
    setAccounts(populatedAccounts);
    setSelectedAccount(populatedAccounts[0]);
  }, []);

  const selectAccount = (index: number) => {
    if (accounts[index]) {
      setSelectedAccount(accounts[index]);
    }
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).midnight) {
      try {
        const midnight = (window as any).midnight;
        const api = await midnight.mnLace.enable();
        setIsConnected(true);
        console.log("Connected to Midnight Lace:", api);
      } catch (err) {
        console.warn("Midnight Lace connect rejected, using simulated wallet", err);
      }
    }
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
  };

  const requestFaucet = () => {
    if (!selectedAccount) return;
    const updated = accounts.map((acc) => {
      if (acc.address === selectedAccount.address) {
        return { ...acc, balance: acc.balance + 500 };
      }
      return acc;
    });
    setAccounts(updated);
    setSelectedAccount((prev) => (prev ? { ...prev, balance: prev.balance + 500 } : null));
  };

  const registerNewCredential = (name: string): VoterProfile => {
    const secretKey = generateSecretKey();
    const blindingFactor = generateSecretKey();
    const commitment = createVoterCommitment(secretKey, blindingFactor);
    const address = "mn_addr_test1qrx8" + poseidonHash([name, secretKey]).slice(2, 34);

    const newIndex = merkleTree.insertLeaf(commitment);
    const newProfile: VoterProfile = {
      name,
      address,
      balance: 100,
      secretKey,
      blindingFactor,
      commitment,
      merkleIndex: newIndex,
      hasVotedOn: {}
    };

    const updated = [...accounts, newProfile];
    setAccounts(updated);
    setSelectedAccount(newProfile);
    return newProfile;
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isLaceInjected,
        selectedAccount,
        accounts,
        merkleTree,
        voterRegistryRoot: merkleTree.getRoot(),
        selectAccount,
        connectWallet,
        disconnectWallet,
        requestFaucet,
        registerNewCredential
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