import { describe, it, expect } from "vitest";
import { MidnightContractSimulator } from "../contracts/contractSimulator";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment } from "../crypto/poseidon";
import { ZkProofEngine, ZkWitness } from "../crypto/zkProofEngine";

describe("Midnight Ledger State Transitions & Tallies", () => {
  it("correctly accumulates anonymous votes across multiple distinct voters", async () => {
    const tree = new MerkleTree(8);

    // Voter 1: Alice
    const aliceSecret = "0xalice_secret_1";
    const aliceBlind = "0xalice_blind_1";
    const aliceIdx = tree.insertLeaf(createVoterCommitment(aliceSecret, aliceBlind));

    // Voter 2: Bob
    const bobSecret = "0xbob_secret_2";
    const bobBlind = "0xbob_blind_2";
    const bobIdx = tree.insertLeaf(createVoterCommitment(bobSecret, bobBlind));

    // Voter 3: Charlie
    const charlieSecret = "0xcharlie_secret_3";
    const charlieBlind = "0xcharlie_blind_3";
    const charlieIdx = tree.insertLeaf(createVoterCommitment(charlieSecret, charlieBlind));

    const simulator = new MidnightContractSimulator(tree);
    const prop = simulator.createProposal("Multi-Voter Governance", "Testing tallies", "Governance", ["Option A", "Option B"]);

    // Alice votes Option A (index 0)
    const proofAlice = await ZkProofEngine.generateProof({
      voterSecret: aliceSecret,
      voterBlinding: aliceBlind,
      choice: 0,
      merkleProof: tree.getProof(aliceIdx)
    }, prop.id, 2);
    simulator.castShieldedVote(proofAlice, 0);

    // Bob votes Option A (index 0)
    const proofBob = await ZkProofEngine.generateProof({
      voterSecret: bobSecret,
      voterBlinding: bobBlind,
      choice: 0,
      merkleProof: tree.getProof(bobIdx)
    }, prop.id, 2);
    simulator.castShieldedVote(proofBob, 0);

    // Charlie votes Option B (index 1)
    const proofCharlie = await ZkProofEngine.generateProof({
      voterSecret: charlieSecret,
      voterBlinding: charlieBlind,
      choice: 1,
      merkleProof: tree.getProof(charlieIdx)
    }, prop.id, 2);
    simulator.castShieldedVote(proofCharlie, 1);

    const updatedProp = simulator.getProposal(prop.id);
    expect(updatedProp?.totalVotes).toBe(3);
    expect(updatedProp?.options[0].voteCount).toBe(2);
    expect(updatedProp?.options[1].voteCount).toBe(1);
    expect(simulator.getState().totalShieldedVotesCast).toBe(3);
    expect(simulator.getState().nullifiers.length).toBe(3);
  });
});