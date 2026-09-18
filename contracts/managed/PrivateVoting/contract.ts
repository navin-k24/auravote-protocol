/**
 * Midnight Compact Runtime Contract Bindings: PrivateVoting
 * Compiled from contracts/PrivateVoting.compact
 * Implements the Midnight Compact execution model for on-chain state transitions and ZK verification
 */

import { Proposal, OnChainLedgerState, PrivateWitness, ProposalStatus } from "../../../src/midnight/types";
import { poseidonHash } from "../../../src/crypto/poseidon";

export interface CompactContractState {
  admin: string;
  proposals: Map<string, Proposal>;
  nullifiers: Set<string>;
  voterRegistryRoot: string;
  totalProposalsCount: bigint;
  totalShieldedVotesCast: bigint;
}

export class PrivateVotingContract {
  public state: CompactContractState;

  constructor(initialState?: Partial<CompactContractState>) {
    this.state = {
      admin: initialState?.admin || "0x0000000000000000000000000000000000000000000000000000000000000000",
      proposals: initialState?.proposals || new Map<string, Proposal>(),
      nullifiers: initialState?.nullifiers || new Set<string>(),
      voterRegistryRoot: initialState?.voterRegistryRoot || "0x0000000000000000000000000000000000000000000000000000000000000000",
      totalProposalsCount: initialState?.totalProposalsCount || 0n,
      totalShieldedVotesCast: initialState?.totalShieldedVotesCast || 0n
    };
  }

  /**
   * Circuit: initializeRegistry(initialRoot: Bytes<32>, adminKey: Bytes<32>)
   */
  public initializeRegistry(initialRoot: string, adminKey: string): void {
    if (this.state.admin !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      throw new Error("Already initialized");
    }
    this.state.admin = adminKey;
    this.state.voterRegistryRoot = initialRoot;
    this.state.totalProposalsCount = 0n;
    this.state.totalShieldedVotesCast = 0n;
  }

  /**
   * Circuit: createProposal(...)
   */
  public createProposal(
    proposalId: string,
    title: string,
    description: string,
    optionsCount: number,
    registryRoot: string,
    deadline: number,
    currentTime: number,
    creator: string = "Admin"
  ): Proposal {
    if (optionsCount < 2 || optionsCount > 8) {
      throw new Error("Options must be between 2 and 8");
    }
    if (deadline <= currentTime) {
      throw new Error("Deadline must be in future");
    }
    if (this.state.proposals.has(proposalId)) {
      throw new Error("Proposal ID already exists");
    }

    const options = Array.from({ length: optionsCount }, (_, i) => ({
      id: i,
      label: `Option ${i + 1}`,
      voteCount: 0
    }));

    const proposal: Proposal = {
      id: proposalId,
      title,
      description,
      category: "Governance",
      options,
      totalVotes: 0,
      voterRegistryRoot: registryRoot,
      minThreshold: 1,
      createdAt: currentTime,
      deadline,
      status: "Active",
      creator
    };

    this.state.proposals.set(proposalId, proposal);
    this.state.totalProposalsCount += 1n;
    return proposal;
  }

  /**
   * Circuit: castShieldedVote(proposalId, publicRoot, currentTime)
   * Witness: { voterSecret, voterBlinding, rawChoice, merklePath, merkleIndices }
   */
  public castShieldedVote(
    proposalId: string,
    publicRoot: string,
    currentTime: number,
    witness: PrivateWitness
  ): { nullifier: string; success: boolean } {
    // 1. Read and validate proposal from public ledger
    const prop = this.state.proposals.get(proposalId);
    if (!prop) {
      throw new Error("Proposal does not exist");
    }
    if (prop.status !== "Active") {
      throw new Error("Proposal is not active");
    }
    if (currentTime > prop.deadline) {
      throw new Error("Voting deadline has passed");
    }

    // 2. Validate choice range
    if (witness.rawChoice < 0 || witness.rawChoice >= prop.options.length) {
      throw new Error("Invalid choice selected");
    }

    // 3. Compute voter commitment = Poseidon(secret, blinding)
    const voterCommitment = poseidonHash([witness.voterSecret, witness.voterBlinding]);

    // 4. Verify Merkle root from witness path
    const computedRoot = this.computeMerkleRoot(voterCommitment, witness.merklePath, witness.merkleIndices);
    if (computedRoot.toLowerCase() !== prop.voterRegistryRoot.toLowerCase()) {
      throw new Error("Voter not eligible or invalid Merkle proof");
    }

    // 5. Derive deterministic nullifier = Poseidon(proposalId, voterSecret)
    const nullifier = poseidonHash([proposalId, witness.voterSecret]);

    // 6. Ensure nullifier replay protection (prevent double-voting)
    if (this.state.nullifiers.has(nullifier)) {
      throw new Error("Nullifier already spent: Double-voting attempt rejected");
    }

    // 7. Apply state transitions to public ledger
    this.state.nullifiers.add(nullifier);
    prop.options[witness.rawChoice].voteCount += 1;
    prop.totalVotes += 1;
    this.state.proposals.set(proposalId, prop);
    this.state.totalShieldedVotesCast += 1n;

    return { nullifier, success: true };
  }

  /**
   * Circuit helper: computeMerkleRoot
   */
  public computeMerkleRoot(leaf: string, path: string[], indices: boolean[]): string {
    let current = leaf;
    for (let i = 0; i < path.length; i++) {
      if (indices[i]) {
        current = poseidonHash([path[i], current]);
      } else {
        current = poseidonHash([current, path[i]]);
      }
    }
    return current;
  }

  /**
   * Export ledger snapshot
   */
  public getLedgerState(): OnChainLedgerState {
    const proposalsObj: Record<string, Proposal> = {};
    for (const [id, p] of this.state.proposals.entries()) {
      proposalsObj[id] = { ...p, options: p.options.map((o) => ({ ...o })) };
    }

    return {
      admin: this.state.admin,
      proposals: proposalsObj,
      nullifiers: Array.from(this.state.nullifiers),
      voterRegistryRoot: this.state.voterRegistryRoot,
      totalProposalsCount: Number(this.state.totalProposalsCount),
      totalShieldedVotesCast: Number(this.state.totalShieldedVotesCast),
      currentBlockHeight: 142100 + Number(this.state.totalShieldedVotesCast)
    };
  }
}
