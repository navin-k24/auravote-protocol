import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Proposal, OnChainLedgerState, OnChainTransactionAudit, PrivateWitness } from "../midnight/types";
import { midnightContractClient, CastVoteProgressCallback } from "../midnight/contractClient";
import { useWallet } from "./WalletContext";

interface VotingContextType {
  proposals: Proposal[];
  ledgerState: OnChainLedgerState | null;
  auditTrail: OnChainTransactionAudit[];
  isVoting: boolean;
  isLoadingLedger: boolean;
  currentProofProgress: { step: string; percentage: number } | null;
  lastCastVoteResult: { nullifier: string; proofHash: string; txHash: string } | null;
  createProposal: (
    title: string,
    description: string,
    category: "Governance" | "Treasury" | "Protocol" | "Community",
    options: string[],
    durationSeconds?: number
  ) => Promise<Proposal>;
  castVote: (
    proposalId: string,
    choiceIndex: number,
    onProgress?: CastVoteProgressCallback
  ) => Promise<{ success: boolean; nullifier: string; proofHash: string; txHash: string }>;
  refreshLedger: () => Promise<void>;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedAccount, merkleTree, voterRegistryRoot } = useWallet();
  const [ledgerState, setLedgerState] = useState<OnChainLedgerState | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [auditTrail, setAuditTrail] = useState<OnChainTransactionAudit[]>([]);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [isLoadingLedger, setIsLoadingLedger] = useState<boolean>(false);
  const [currentProofProgress, setCurrentProofProgress] = useState<{ step: string; percentage: number } | null>(null);
  const [lastCastVoteResult, setLastCastVoteResult] = useState<{
    nullifier: string;
    proofHash: string;
    txHash: string;
  } | null>(null);

  // Synchronize state from Midnight Ledger / Indexer
  const refreshLedger = useCallback(async () => {
    setIsLoadingLedger(true);
    try {
      const state = await midnightContractClient.getLedgerState();
      const audit = await midnightContractClient.getAuditTrail();
      setLedgerState(state);
      setProposals(Object.values(state.proposals));
      setAuditTrail(audit);
    } catch (err) {
      console.error("Error reading Midnight ledger state:", err);
    } finally {
      setIsLoadingLedger(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    // Initialize default proposals on contract runtime if clean
    midnightContractClient.initializeRegistry(
      voterRegistryRoot,
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );

    midnightContractClient
      .createProposal(
        "MIP-004: Activate UltraPlonk Recursive Prover on Devnet-Halo",
        "Deploy the optimized UltraPlonk recursive ZK-SNARK verifier circuit to reduce on-chain verification gas costs by 68% for shielded transactions.",
        3,
        voterRegistryRoot,
        86400 * 5,
        "0xMidnightCoreDevs"
      )
      .then(() => {
        return midnightContractClient.createProposal(
          "MIP-005: Allocate 500k tDUST for Privacy-Preserving Payroll dApps",
          "Community treasury grant program to sponsor teams building zero-knowledge private payroll and confidential split streaming protocols on Midnight.",
          3,
          voterRegistryRoot,
          86400 * 10,
          "0xMidnightTreasuryDAO"
        );
      })
      .then(() => {
        refreshLedger();
      });
  }, [voterRegistryRoot, refreshLedger]);

  const createProposal = async (
    title: string,
    description: string,
    category: "Governance" | "Treasury" | "Protocol" | "Community",
    options: string[],
    durationSeconds: number = 86400 * 7
  ): Promise<Proposal> => {
    const proposal = await midnightContractClient.createProposal(
      title,
      description,
      options.length,
      voterRegistryRoot,
      durationSeconds,
      selectedAccount?.address || "Admin"
    );

    await refreshLedger();
    return proposal;
  };

  const castVote = async (
    proposalId: string,
    choiceIndex: number,
    onProgress?: CastVoteProgressCallback
  ): Promise<{ success: boolean; nullifier: string; proofHash: string; txHash: string }> => {
    if (!selectedAccount) {
      throw new Error("No Midnight Lace wallet connected. Please connect your Lace wallet.");
    }

    setIsVoting(true);
    setCurrentProofProgress({ step: "Preparing witness and private secrets...", percentage: 5 });

    try {
      // 1. Generate Merkle membership proof from voter tree
      const merkleProof = merkleTree.getProof(selectedAccount.merkleIndex);

      // 2. Prepare Private Witness State (The Shadow)
      const witness: PrivateWitness = {
        voterSecret: selectedAccount.secretKey,
        voterBlinding: selectedAccount.blindingFactor,
        rawChoice: choiceIndex,
        merklePath: merkleProof.path,
        merkleIndices: merkleProof.indices
      };

      const handleProgress: CastVoteProgressCallback = (step, percentage) => {
        setCurrentProofProgress({ step, percentage });
        onProgress?.(step, percentage);
      };

      // 3. Execute Compact circuit transition & submit transaction to Midnight
      const result = await midnightContractClient.castShieldedVote(
        proposalId,
        voterRegistryRoot,
        witness,
        handleProgress
      );

      setLastCastVoteResult({
        nullifier: result.nullifier,
        proofHash: result.proofHash,
        txHash: result.txHash
      });

      await refreshLedger();

      return {
        success: result.success,
        nullifier: result.nullifier,
        proofHash: result.proofHash,
        txHash: result.txHash
      };
    } finally {
      setIsVoting(false);
      setTimeout(() => setCurrentProofProgress(null), 2500);
    }
  };

  return (
    <VotingContext.Provider
      value={{
        proposals,
        ledgerState,
        auditTrail,
        isVoting,
        isLoadingLedger,
        currentProofProgress,
        lastCastVoteResult,
        createProposal,
        castVote,
        refreshLedger
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error("useVoting must be used within a VotingProvider");
  }
  return context;
};