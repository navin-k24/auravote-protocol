/**
 * Midnight Compact Runtime Test Suite: PrivateVotingContract
 * Validates Compact circuits, witness state evaluation, nullifier collisions, and on-chain ledger transitions
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PrivateVotingContract } from "../managed/PrivateVoting/contract";
import { MerkleTree } from "../../src/crypto/merkle";
import { createVoterCommitment, poseidonHash } from "../../src/crypto/poseidon";
import { PrivateWitness } from "../../src/midnight/types";

describe("PrivateVoting Compact Runtime & Circuit Verification", () => {
  let contract: PrivateVotingContract;
  let tree: MerkleTree;
  let initialRoot: string;
  const adminKey = "0x0000000000000000000000000000000000000000000000000000000000000001";

  beforeEach(() => {
    tree = new MerkleTree(8);
    initialRoot = tree.getRoot();
    contract = new PrivateVotingContract();
    contract.initializeRegistry(initialRoot, adminKey);
  });

  describe("Registry Initialization Circuit", () => {
    it("initializes registry with valid Merkle root and admin key", () => {
      const state = contract.getLedgerState();
      expect(state.admin).toBe(adminKey);
      expect(state.voterRegistryRoot).toBe(initialRoot);
      expect(state.totalProposalsCount).toBe(0);
      expect(state.totalShieldedVotesCast).toBe(0);
    });

    it("reverts if initializeRegistry is called a second time", () => {
      expect(() => contract.initializeRegistry(initialRoot, adminKey)).toThrow("Already initialized");
    });
  });

  describe("Proposal Creation Circuit", () => {
    it("creates a proposal with valid parameters", () => {
      const propId = "0x" + "1".repeat(64);
      const now = Date.now();
      const deadline = now + 86400 * 7 * 1000;

      const prop = contract.createProposal(
        propId,
        "Upgrade ZK Prover",
        "Proposal description",
        3,
        initialRoot,
        deadline,
        now,
        "0xAdmin"
      );

      expect(prop.id).toBe(propId);
      expect(prop.options.length).toBe(3);
      expect(prop.totalVotes).toBe(0);
      expect(contract.getLedgerState().totalProposalsCount).toBe(1);
    });

    it("reverts if optionsCount is less than 2 or greater than 8", () => {
      const now = Date.now();
      expect(() =>
        contract.createProposal("0xprop1", "Title", "Desc", 1, initialRoot, now + 1000, now)
      ).toThrow("Options must be between 2 and 8");

      expect(() =>
        contract.createProposal("0xprop2", "Title", "Desc", 9, initialRoot, now + 1000, now)
      ).toThrow("Options must be between 2 and 8");
    });

    it("reverts if deadline is in the past", () => {
      const now = Date.now();
      expect(() =>
        contract.createProposal("0xprop3", "Title", "Desc", 3, initialRoot, now - 1000, now)
      ).toThrow("Deadline must be in future");
    });
  });

  describe("Confidential Ballot Casting (castShieldedVote)", () => {
    it("accepts valid shielded vote from eligible voter and increments option tally", () => {
      // 1. Setup voter in Merkle tree
      const secret = "0xvoter_secret_1";
      const blinding = "0xvoter_blinding_1";
      const commitment = createVoterCommitment(secret, blinding);
      const leafIndex = tree.insertLeaf(commitment);
      const updatedRoot = tree.getRoot();

      // 2. Create proposal with updated root
      const propId = "0xproposal_vote_test";
      const now = Date.now();
      contract.createProposal(propId, "Test Vote", "Desc", 3, updatedRoot, now + 100000, now);

      // 3. Construct Private Witness
      const merkleProof = tree.getProof(leafIndex);
      const witness: PrivateWitness = {
        voterSecret: secret,
        voterBlinding: blinding,
        rawChoice: 1, // Vote for option 2 (index 1)
        merklePath: merkleProof.path,
        merkleIndices: merkleProof.indices
      };

      // 4. Cast shielded vote
      const result = contract.castShieldedVote(propId, updatedRoot, now + 10, witness);
      expect(result.success).toBe(true);
      expect(result.nullifier.startsWith("0x")).toBe(true);

      // 5. Verify on-chain ledger state
      const ledger = contract.getLedgerState();
      const updatedProp = ledger.proposals[propId];
      expect(updatedProp.totalVotes).toBe(1);
      expect(updatedProp.options[1].voteCount).toBe(1);
      expect(updatedProp.options[0].voteCount).toBe(0);
      expect(ledger.totalShieldedVotesCast).toBe(1);
      expect(ledger.nullifiers).toContain(result.nullifier);
    });

    it("reverts double-voting attempt with nullifier collision", () => {
      const secret = "0xvoter_secret_alice";
      const blinding = "0xvoter_blinding_alice";
      const commitment = createVoterCommitment(secret, blinding);
      const leafIndex = tree.insertLeaf(commitment);
      const updatedRoot = tree.getRoot();

      const propId = "0xprop_double_vote";
      const now = Date.now();
      contract.createProposal(propId, "Double Vote Test", "Desc", 2, updatedRoot, now + 100000, now);

      const merkleProof = tree.getProof(leafIndex);
      const witness: PrivateWitness = {
        voterSecret: secret,
        voterBlinding: blinding,
        rawChoice: 0,
        merklePath: merkleProof.path,
        merkleIndices: merkleProof.indices
      };

      // First vote: succeeds
      contract.castShieldedVote(propId, updatedRoot, now, witness);

      // Second vote: MUST fail with nullifier replay rejection
      expect(() =>
        contract.castShieldedVote(propId, updatedRoot, now + 10, witness)
      ).toThrow("Nullifier already spent: Double-voting attempt rejected");
    });

    it("reverts if voter commitment does not match Merkle tree root", () => {
      const unlistedSecret = "0xunlisted_secret";
      const unlistedBlinding = "0xunlisted_blinding";
      const propId = "0xprop_invalid_root";
      const now = Date.now();
      contract.createProposal(propId, "Invalid Root Test", "Desc", 2, tree.getRoot(), now + 100000, now);

      const witness: PrivateWitness = {
        voterSecret: unlistedSecret,
        voterBlinding: unlistedBlinding,
        rawChoice: 0,
        merklePath: tree.getProof(0).path,
        merkleIndices: tree.getProof(0).indices
      };

      expect(() =>
        contract.castShieldedVote(propId, tree.getRoot(), now, witness)
      ).toThrow("Voter not eligible or invalid Merkle proof");
    });
  });
});
