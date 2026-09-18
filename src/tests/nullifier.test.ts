import { describe, it, expect } from "vitest";
import { deriveNullifier } from "../crypto/nullifier";
import { PrivateVotingContract } from "../../contracts/managed/PrivateVoting/contract";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment } from "../crypto/poseidon";
import { PrivateWitness } from "../midnight/types";

describe("Nullifier & Double-Voting Replay Prevention", () => {
  it("derives deterministic nullifier for the same proposal and secret", () => {
    const proposalId = "0xproposal_alpha_123";
    const secret = "0xsecret_key_voter_alice";

    const n1 = deriveNullifier(proposalId, secret);
    const n2 = deriveNullifier(proposalId, secret);

    expect(n1).toBe(n2);
    expect(n1.startsWith("0x")).toBe(true);
  });

  it("produces unlinkable nullifiers across different proposals for the same voter", () => {
    const secret = "0xsecret_key_voter_alice";
    const propA = "0xproposal_A";
    const propB = "0xproposal_B";

    const nullifierA = deriveNullifier(propA, secret);
    const nullifierB = deriveNullifier(propB, secret);

    expect(nullifierA).not.toBe(nullifierB);
  });

  it("rejects double voting attempts on the Midnight ledger", async () => {
    const tree = new MerkleTree(8);
    const secretKey = "0x4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b";
    const blinding = "0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00";
    const commitment = createVoterCommitment(secretKey, blinding);
    const leafIndex = tree.insertLeaf(commitment);
    const root = tree.getRoot();

    const contract = new PrivateVotingContract();
    contract.initializeRegistry(root, "0x0000000000000000000000000000000000000000000000000000000000000001");

    const now = Date.now();
    const propId = "0xprop_nullifier_test";
    contract.createProposal(propId, "Proposal Test", "Desc", 2, root, now + 100000, now);

    const witness: PrivateWitness = {
      voterSecret: secretKey,
      voterBlinding: blinding,
      rawChoice: 0,
      merklePath: tree.getProof(leafIndex).path,
      merkleIndices: tree.getProof(leafIndex).indices
    };

    // First vote: must succeed
    const res1 = contract.castShieldedVote(propId, root, now + 1, witness);
    expect(res1.success).toBe(true);

    // Second vote attempt by same voter on same proposal: MUST fail with Nullifier already spent
    expect(() =>
      contract.castShieldedVote(propId, root, now + 2, witness)
    ).toThrow("Nullifier already spent: Double-voting attempt rejected");
  });
});