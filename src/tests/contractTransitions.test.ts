import { describe, it, expect } from "vitest";
import { PrivateVotingContract } from "../../contracts/managed/PrivateVoting/contract";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment } from "../crypto/poseidon";
import { PrivateWitness } from "../midnight/types";

describe("Midnight Ledger State Transitions & Tallies", () => {
  it("correctly accumulates anonymous votes across multiple distinct voters on the Compact runtime", async () => {
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

    const contract = new PrivateVotingContract();
    const root = tree.getRoot();
    contract.initializeRegistry(root, "0x0000000000000000000000000000000000000000000000000000000000000001");

    const now = Date.now();
    const propId = "0xprop_multi_voter";
    contract.createProposal(propId, "Multi-Voter Governance", "Testing tallies", 2, root, now + 100000, now);

    // Alice votes Option A (index 0)
    const witnessAlice: PrivateWitness = {
      voterSecret: aliceSecret,
      voterBlinding: aliceBlind,
      rawChoice: 0,
      merklePath: tree.getProof(aliceIdx).path,
      merkleIndices: tree.getProof(aliceIdx).indices
    };
    contract.castShieldedVote(propId, root, now + 1, witnessAlice);

    // Bob votes Option A (index 0)
    const witnessBob: PrivateWitness = {
      voterSecret: bobSecret,
      voterBlinding: bobBlind,
      rawChoice: 0,
      merklePath: tree.getProof(bobIdx).path,
      merkleIndices: tree.getProof(bobIdx).indices
    };
    contract.castShieldedVote(propId, root, now + 2, witnessBob);

    // Charlie votes Option B (index 1)
    const witnessCharlie: PrivateWitness = {
      voterSecret: charlieSecret,
      voterBlinding: charlieBlind,
      rawChoice: 1,
      merklePath: tree.getProof(charlieIdx).path,
      merkleIndices: tree.getProof(charlieIdx).indices
    };
    contract.castShieldedVote(propId, root, now + 3, witnessCharlie);

    const ledger = contract.getLedgerState();
    const updatedProp = ledger.proposals[propId];

    expect(updatedProp?.totalVotes).toBe(3);
    expect(updatedProp?.options[0].voteCount).toBe(2);
    expect(updatedProp?.options[1].voteCount).toBe(1);
    expect(ledger.totalShieldedVotesCast).toBe(3);
    expect(ledger.nullifiers.length).toBe(3);
  });
});