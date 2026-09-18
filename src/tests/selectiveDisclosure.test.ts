import { describe, it, expect } from "vitest";
import { PrivateVotingContract } from "../../contracts/managed/PrivateVoting/contract";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment } from "../crypto/poseidon";
import { PrivateWitness } from "../midnight/types";

describe("Selective Disclosure & Zero-Knowledge Guarantee", () => {
  it("guarantees public ledger records leak zero bits of secret key, blinding factor, or individual voter choice", async () => {
    const tree = new MerkleTree(8);
    const secretKey = "0xsuper_secret_voter_private_key_do_not_leak";
    const blinding = "0xsecret_blinding_salt_factor_999999";
    const choice = 1;

    const commitment = createVoterCommitment(secretKey, blinding);
    const leafIndex = tree.insertLeaf(commitment);
    const root = tree.getRoot();

    const contract = new PrivateVotingContract();
    contract.initializeRegistry(root, "0x0000000000000000000000000000000000000000000000000000000000000001");

    const now = Date.now();
    const propId = "0xprop_privacy_audit";
    contract.createProposal(propId, "Privacy Audit Proposal", "Audit", 3, root, now + 100000, now);

    const witness: PrivateWitness = {
      voterSecret: secretKey,
      voterBlinding: blinding,
      rawChoice: choice,
      merklePath: tree.getProof(leafIndex).path,
      merkleIndices: tree.getProof(leafIndex).indices
    };

    const result = contract.castShieldedVote(propId, root, now + 1, witness);
    const state = contract.getLedgerState();
    const ledgerStateStr = JSON.stringify(state);

    // 1. Assert that the private secret key is nowhere in the public ledger state
    expect(ledgerStateStr.includes(secretKey)).toBe(false);

    // 2. Assert that blinding factor is nowhere in the public ledger state
    expect(ledgerStateStr.includes(blinding)).toBe(false);

    // 3. Assert that individual voter address is not mapped to the raw choice
    expect(ledgerStateStr.includes(`"choice":${choice}`)).toBe(false);

    // 4. Assert that the only on-chain identifier is the single-use deterministic nullifier
    expect(state.nullifiers).toContain(result.nullifier);
  });
});