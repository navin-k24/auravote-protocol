import React, { createContext, useContext, useState, useEffect } from "react";
import { Proposal, LedgerState, LedgerAuditRecord } from "../contracts/types";
import { MidnightContractSimulator } from "../contracts/contractSimulator";
import { useWallet } from "./WalletContext";
import { ZkProofEngine, ZkWitness, ZkProof, StepProgressCallback } from "../crypto/zkProofEngine";

interface VotingContextType {
  proposals: Proposal[];
  ledgerState: LedgerState;
  auditTrail: LedgerAuditRecord[];
  isVoting: boolean;
  currentProofProgress: { step: string; percentage: number } | null;
  lastGeneratedProof: ZkProof | null;
  createProposal: (
    title: string,
    description: string,
    category: "Governance" | "Treasury" | "Protocol" | "Community",
    options: string[],
    durationSeconds?: number
  ) => Proposal;
  castVote: (proposalId: string, choiceIndex: number, onProgress?: StepProgressCallback) => Promise<{ success: boolean; message: string; proof: ZkProof }>;
  refreshLedger: () => void;
  resetAllData: () => void;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedAccount, merkleTree, voterRegistryRoot } = useWallet();
  const [simulator, setSimulator] = useState<MidnightContractSimulator>(() => new MidnightContractSimulator(merkleTree));
  const [ledgerState, setLedgerState] = useState<LedgerState>(() => simulator.getState());
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [auditTrail, setAuditTrail] = useState<LedgerAuditRecord[]>([]);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [currentProofProgress, setCurrentProofProgress] = useState<{ step: string; percentage: number } | null>(null);
  const [lastGeneratedProof, setLastGeneratedProof] = useState<ZkProof | null>(null);

  // Initialize with canonical Midnight governance proposals if empty
  useEffect(() => {
    const sim = new MidnightContractSimulator(merkleTree);
    const existing = sim.getProposals();

    if (existing.length === 0) {
      sim.createProposal(
        "MIP-004: Activate UltraPlonk Recursive Prover on Devnet-Halo",
        "Deploy the optimized UltraPlonk recursive ZK-SNARK verifier circuit to reduce on-chain verification gas costs by 68% for shielded transactions.",
        "Protocol",
        ["Approve Upgrade", "Reject & Audit", "Abstain"],
        86400 * 5,
        "0xMidnightCoreDevs"
      );

      sim.createProposal(
        "MIP-005: Allocate 500k tDUST for Privacy-Preserving Payroll dApps",
        "Community treasury grant program to sponsor teams building zero-knowledge private payroll and confidential split streaming protocols on Midnight.",
        "Treasury",
        ["Yes (Fund 500k tDUST)", "No", "Defer to Q2"],
        86400 * 10,
        "0xMidnightTreasuryDAO"
      );

      sim.createProposal(
        "MIP-006: Standardize ERC-Shielded Token Interface for Compact",
        "Form a technical working group to standardize confidential multi-asset token definitions in Compact v0.20+ with selective disclosure hooks.",
        "Governance",
        ["Standardize Interface", "Maintain Flexible Schemas"],
        86400 * 14,
        "0xMidnightStandards"
      );
    }

    setSimulator(sim);
    const updatedState = sim.getState();
    setLedgerState(updatedState);
    setProposals(Object.values(updatedState.proposals));
    setAuditTrail(updatedState.auditTrail);
  }, [merkleTree]);

  const refreshLedger = () => {
    const updated = simulator.getState();
    setLedgerState(updated);
    setProposals(Object.values(updated.proposals));
    setAuditTrail(updated.auditTrail);
  };

  const createProposal = (
    title: string,
    description: string,
    category: "Governance" | "Treasury" | "Protocol" | "Community",
    options: string[],
    durationSeconds: number = 86400 * 7
  ): Proposal => {
    const proposal = simulator.createProposal(
      title,
      description,
      category,
      options,
      durationSeconds,
      selectedAccount?.name || "Anonymous Member"
    );
    refreshLedger();
    return proposal;
  };

  const castVote = async (
    proposalId: string,
    choiceIndex: number,
    onProgress?: StepProgressCallback
  ): Promise<{ success: boolean; message: string; proof: ZkProof }> => {
    if (!selectedAccount) {
      throw new Error("No wallet connected. Please connect your Midnight Lace wallet.");
    }

    setIsVoting(true);
    setCurrentProofProgress({ step: "Preparing witness and private secrets...", percentage: 5 });

    try {
      // 1. Generate Merkle membership proof from tree
      const merkleProof = merkleTree.getProof(selectedAccount.merkleIndex);

      // 2. Prepare Private Witness State (Shadow)
      const witness: ZkWitness = {
        voterSecret: selectedAccount.secretKey,
        voterBlinding: selectedAccount.blindingFactor,
        choice: choiceIndex,
        merkleProof
      };

      const handleProgress: StepProgressCallback = (step, percentage) => {
        setCurrentProofProgress({ step, percentage });
        onProgress?.(step, percentage);
      };

      const proposal = simulator.getProposal(proposalId);
      if (!proposal) throw new Error("Proposal not found");

      // 3. Generate client-side Zero-Knowledge Proof
      const proof = await ZkProofEngine.generateProof(witness, proposalId, proposal.options.length, handleProgress);
      setLastGeneratedProof(proof);

      // 4. Submit Proof to Midnight Compact Circuit on Ledger
      handleProgress("Submitting zk-SNARK proof to Midnight Ledger...", 95);
      await new Promise((r) => setTimeout(r, 120));

      const result = simulator.castShieldedVote(proof, choiceIndex);
      refreshLedger();

      handleProgress("Vote Verified and Committed to On-Chain State!", 100);
      return {
        success: result.success,
        message: result.message,
        proof
      };
    } finally {
      setIsVoting(false);
      setTimeout(() => setCurrentProofProgress(null), 2000);
    }
  };

  const resetAllData = () => {
    simulator.resetLedger();
    refreshLedger();
  };

  return (
    <VotingContext.Provider
      value={{
        proposals,
        ledgerState,
        auditTrail,
        isVoting,
        currentProofProgress,
        lastGeneratedProof,
        createProposal,
        castVote,
        refreshLedger,
        resetAllData
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