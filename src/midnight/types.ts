/**
 * Midnight DApp Types & Contract Interfaces
 * Complies with Compact Language v0.20 and Midnight JS SDK
 */

export type ProposalStatus = "Active" | "Closed" | "Finalized";

export interface ProposalOption {
  id: number;
  label: string;
  voteCount: number;
}

export interface Proposal {
  id: string; // 32-byte hex string
  title: string;
  description: string;
  category: "Governance" | "Treasury" | "Protocol" | "Community";
  options: ProposalOption[];
  totalVotes: number;
  voterRegistryRoot: string;
  minThreshold: number;
  createdAt: number;
  deadline: number;
  status: ProposalStatus;
  creator: string;
}

export interface OnChainLedgerState {
  admin: string;
  proposals: Record<string, Proposal>;
  nullifiers: string[];
  voterRegistryRoot: string;
  totalProposalsCount: number;
  totalShieldedVotesCast: number;
  currentBlockHeight: number;
}

export interface OnChainTransactionAudit {
  txId: string;
  blockHeight: number;
  timestamp: number;
  circuitName: "initializeRegistry" | "createProposal" | "castShieldedVote";
  proposalId?: string;
  proposalTitle?: string;
  nullifier?: string;
  merkleRoot?: string;
  proofHash?: string;
  status: "Committed" | "Pending" | "Reverted";
}

/**
 * Client-Side Private Witness State (Shadow)
 * Never leaves the voter's local device sandbox
 */
export interface PrivateWitness {
  voterSecret: string; // 32-byte hex string
  voterBlinding: string; // 32-byte hex string
  rawChoice: number; // 0..optionsCount - 1
  merklePath: string[]; // 8 sibling hashes
  merkleIndices: boolean[]; // 8 path direction bits
}

/**
 * Midnight Lace Injected API Type Definitions
 */
export interface MidnightLaceAPI {
  isEnabled: () => Promise<boolean>;
  enable: () => Promise<MidnightLaceSession>;
  name: string;
  icon: string;
  apiVersion: string;
}

export interface MidnightLaceSession {
  state: () => Promise<{
    address: string;
    networkId: string;
    balance: string; // tDUST in lovelace/smallest unit
    publicKey: string;
  }>;
  signTransaction: (txPayload: any) => Promise<{ signature: string; txHash: string }>;
  submitTransaction: (signedTx: any) => Promise<{ txHash: string; blockHeight: number }>;
}

export interface WalletState {
  isConnected: boolean;
  isLaceInstalled: boolean;
  address: string | null;
  networkId: string;
  balance: number; // in tDUST
  publicKey: string | null;
  activeAccountName: string;
}
