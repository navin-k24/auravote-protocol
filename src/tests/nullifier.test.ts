import { describe, it, expect } from "vitest";
import { deriveNullifier } from "../crypto/nullifier";
import { MidnightContractSimulator } from "../contracts/contractSimulator";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment } from "../crypto/poseidon";
import { ZkProofEngine, ZkWitness } from "../crypto/zkProofEngine";

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

    const simulator = new MidnightContractSimulator(tree);
    const prop = simulator.createProposal("Proposal Test", "Desc", "Governance", ["Yes", "No"]);

    const witness: ZkWitness = {
      voterSecret: secretKey,
      voterBlinding: blinding,
      choice: 0,
      merkleProof: tree.getProof(leafIndex)
    };

    // First vote: must succeed
    const proof1 = await ZkProofEngine.generateProof(witness, prop.id, 2);
    const res1 = simulator.castShieldedVote(proof1, 0);
    expect(res1.success).toBe(true);

    // Second vote attempt by same voter on same proposal: MUST fail with Nullifier Collision
    const proof2 = await ZkProofEngine.generateProof(witness, prop.id, 2);
    expect(() => simulator.castShieldedVote(proof2, 1)).toThrow("Nullifier Collision: Double-voting attempt rejected");
  });
});