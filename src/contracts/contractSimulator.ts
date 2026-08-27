import { LedgerState, Proposal, LedgerAuditRecord } from "./types";
import { ZkProof, ZkProofEngine } from "../crypto/zkProofEngine";
import { MerkleTree } from "../crypto/merkle";

const STORAGE_KEY = "midnight_ledger_state_v1";

export class MidnightContractSimulator {
  private state: LedgerState;
  private merkleTree: MerkleTree;

  constructor(initialTree: MerkleTree) {
    this.merkleTree = initialTree;
    this.state = this.loadState();
  }

  private loadState(): LedgerState {
    const defaultState: LedgerState = {
      admin: "0x0000000000000000000000000000000000000000000000000000000000000001",
      proposals: {},
      nullifiers: [],
      voterRegistryRoot: this.merkleTree.getRoot(),
      totalProposalsCount: 0,
      totalShieldedVotesCast: 0,
      auditTrail: [],
      currentBlockHeight: 142085
    };

    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Always ensure the tree root matches
          parsed.voterRegistryRoot = this.merkleTree.getRoot();
          return parsed;
        } catch {
          // fallback to default
        }
      }
    }

    return defaultState;
  }

  private saveState(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }
  }

  public getState(): LedgerState {
    return { ...this.state };
  }

  public getProposal(id: string): Proposal | undefined {
    return this.state.proposals[id];
  }

  public getProposals(): Proposal[] {
    return Object.values(this.state.proposals);
  }

  public createProposal(
    title: string,
    description: string,
    category: "Governance" | "Treasury" | "Protocol" | "Community",
    optionsLabels: string[],
    durationSeconds: number = 86400 * 7,
    creator: string = "0xMidnightDAOAdmin"
  ): Proposal {
    const id = "0x" + Array.from(new Uint8Array(32), () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
    const now = Date.now();

    const options = optionsLabels.map((label, index) => ({
      id: index,
      label,
      voteCount: 0
    }));

    const proposal: Proposal = {
      id,
      title,
      description,
      category,
      options,
      totalVotes: 0,
      voterRegistryRoot: this.state.voterRegistryRoot,
      minThreshold: 1,
      createdAt: now,
      deadline: now + durationSeconds * 1000,
      status: "Active",
      creator
    };

    this.state.proposals[id] = proposal;
    this.state.totalProposalsCount += 1;
    this.state.currentBlockHeight += 1;
    this.saveState();
    return proposal;
  }

  /**
   * Executes the Midnight Compact circuit transition: castShieldedVote
   * Evaluates ZK proof and updates public ledger
   */
  public castShieldedVote(proof: ZkProof, choice: number): { success: boolean; message: string } {
    const { proposalId, nullifier, ballotCommitment } = proof.publicInputs;
    const proposal = this.state.proposals[proposalId];

    if (!proposal) {
      throw new Error(`Execution Reverted: Proposal ${proposalId} does not exist on-chain.`);
    }

    if (proposal.status !== "Active") {
      throw new Error(`Execution Reverted: Proposal status is ${proposal.status}. Voting is closed.`);
    }

    if (Date.now() > proposal.deadline) {
      throw new Error("Execution Reverted: Voting deadline has elapsed.");
    }

    // Constraint: Verify Plonk SNARK proof validity against voterRegistryRoot
    const isValidProof = ZkProofEngine.verifyProof(proof, this.state.voterRegistryRoot);
    if (!isValidProof) {
      throw new Error("ZK-SNARK Verification Failed: Invalid proof or Merkle root mismatch.");
    }

    // Constraint: Check nullifier replay protection (Double-voting prevention)
    if (this.state.nullifiers.includes(nullifier)) {
      throw new Error(`Nullifier Collision: Double-voting attempt rejected! Nullifier ${nullifier.slice(0, 16)}... has already been spent.`);
    }

    if (choice < 0 || choice >= proposal.options.length) {
      throw new Error(`Invalid Choice: Option index ${choice} does not exist on proposal.`);
    }

    // State Transitions (Light / Public State Updates)
    this.state.nullifiers.push(nullifier);
    proposal.options[choice].voteCount += 1;
    proposal.totalVotes += 1;
    this.state.totalShieldedVotesCast += 1;
    this.state.currentBlockHeight += 1;

    // Record on public audit ledger
    const auditRecord: LedgerAuditRecord = {
      id: "tx_" + Math.random().toString(36).substring(2, 9),
      proposalId,
      proposalTitle: proposal.title,
      nullifier,
      ballotCommitment,
      proofHash: proof.proofHash,
      blockHeight: this.state.currentBlockHeight,
      timestamp: Date.now(),
      verified: true
    };

    this.state.auditTrail.unshift(auditRecord);
    this.saveState();

    return {
      success: true,
      message: "Shielded vote successfully validated by Compact circuit and committed to Midnight ledger."
    };
  }

  public resetLedger(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.state = this.loadState();
  }
}