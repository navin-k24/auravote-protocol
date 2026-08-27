import { ZkProof } from "../crypto/zkProofEngine";

export type ProposalStatus = "Active" | "Closed" | "Finalized";

export interface ProposalOption {
  id: number;
  label: string;
  voteCount: number;
}

export interface Proposal {
  id: string; // 32-byte hex
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

export interface LedgerAuditRecord {
  id: string;
  proposalId: string;
  proposalTitle: string;
  nullifier: string;
  ballotCommitment: string;
  proofHash: string;
  blockHeight: number;
  timestamp: number;
  verified: boolean;
}

export interface LedgerState {
  admin: string;
  proposals: Record<string, Proposal>;
  nullifiers: string[]; // Set of spent nullifiers
  voterRegistryRoot: string;
  totalProposalsCount: number;
  totalShieldedVotesCast: number;
  auditTrail: LedgerAuditRecord[];
  currentBlockHeight: number;
}

export interface VoterProfile {
  name: string;
  address: string;
  balance: number;
  secretKey: string;
  blindingFactor: string;
  commitment: string;
  merkleIndex: number;
  hasVotedOn: Record<string, boolean>; // local client cache
}