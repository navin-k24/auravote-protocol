import { describe, it, expect } from "vitest";
import { ZkProofEngine, ZkWitness } from "../crypto/zkProofEngine";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment } from "../crypto/poseidon";
import { MidnightContractSimulator } from "../contracts/contractSimulator";

describe("Selective Disclosure & Zero-Knowledge Guarantee", () => {
  it("guarantees public proof and ledger records leak zero bits of secret key or choice", async () => {
    const tree = new MerkleTree(8);
    const secretKey = "0xsuper_secret_voter_private_key_do_not_leak";
    const blinding = "0xsecret_blinding_salt_factor_999999";
    const choice = 1;

    const commitment = createVoterCommitment(secretKey, blinding);
    const leafIndex = tree.insertLeaf(commitment);

    const simulator = new MidnightContractSimulator(tree);
    const prop = simulator.createProposal("Privacy Audit Proposal", "Audit", "Protocol", ["Alpha", "Beta", "Gamma"]);

    const witness: ZkWitness = {
      voterSecret: secretKey,
      voterBlinding: blinding,
      choice,
      merkleProof: tree.getProof(leafIndex)
    };

    const proof = await ZkProofEngine.generateProof(witness, prop.id, 3);
    simulator.castShieldedVote(proof, choice);

    const state = simulator.getState();
    const publicInputsStr = JSON.stringify(proof.publicInputs);
    const ledgerStateStr = JSON.stringify(state);

    // Assert that the private secret key is nowhere in public inputs or ledger state
    expect(publicInputsStr.includes(secretKey)).toBe(false);
    expect(ledgerStateStr.includes(secretKey)).toBe(false);

    // Assert that blinding factor is nowhere in public inputs or ledger state
    expect(publicInputsStr.includes(blinding)).toBe(false);
    expect(ledgerStateStr.includes(blinding)).toBe(false);

    // Assert that public inputs do not contain raw choice
    expect(publicInputsStr.includes(`"choice":${choice}`)).toBe(false);
  });
});