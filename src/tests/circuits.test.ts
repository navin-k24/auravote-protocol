import { describe, it, expect } from "vitest";
import { ZkProofEngine, ZkWitness } from "../crypto/zkProofEngine";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment } from "../crypto/poseidon";

describe("Midnight Compact Circuits & ZK Proof Engine", () => {
  it("generates a valid zk-SNARK proof for an authorized voter", async () => {
    const tree = new MerkleTree(8);
    const secretKey = "0x1111111111111111111111111111111111111111111111111111111111111111";
    const blinding = "0x2222222222222222222222222222222222222222222222222222222222222222";
    const commitment = createVoterCommitment(secretKey, blinding);
    const leafIndex = tree.insertLeaf(commitment);

    const witness: ZkWitness = {
      voterSecret: secretKey,
      voterBlinding: blinding,
      choice: 0,
      merkleProof: tree.getProof(leafIndex)
    };

    const proof = await ZkProofEngine.generateProof(witness, "0xprop001", 3);
    expect(proof.verified).toBe(true);
    expect(proof.publicInputs.optionsCount).toBe(3);
    expect(proof.publicInputs.voterRegistryRoot).toBe(tree.getRoot());
    expect(ZkProofEngine.verifyProof(proof, tree.getRoot())).toBe(true);
  });

  it("fails when choice is out of allowable options bounds", async () => {
    const tree = new MerkleTree(8);
    const secretKey = "0x1111111111111111111111111111111111111111111111111111111111111111";
    const blinding = "0x2222222222222222222222222222222222222222222222222222222222222222";
    const commitment = createVoterCommitment(secretKey, blinding);
    const leafIndex = tree.insertLeaf(commitment);

    const witness: ZkWitness = {
      voterSecret: secretKey,
      voterBlinding: blinding,
      choice: 5, // optionsCount is 3, choice 5 is invalid
      merkleProof: tree.getProof(leafIndex)
    };

    await expect(
      ZkProofEngine.generateProof(witness, "0xprop001", 3)
    ).rejects.toThrow("Circuit constraint failed: Choice 5 out of bounds");
  });

  it("fails when voter commitment is not in the Merkle tree registry", async () => {
    const tree = new MerkleTree(8);
    // Tree has another voter
    tree.insertLeaf("0x9999999999999999999999999999999999999999999999999999999999999999");

    const unauthorizedSecret = "0xunauthorized0000000000000000000000000000000000000000000000000001";
    const unauthorizedBlinding = "0xblind000000000000000000000000000000000000000000000000000000000001";

    const witness: ZkWitness = {
      voterSecret: unauthorizedSecret,
      voterBlinding: unauthorizedBlinding,
      choice: 1,
      merkleProof: tree.getProof(0) // proof for different leaf
    };

    await expect(
      ZkProofEngine.generateProof(witness, "0xprop001", 3)
    ).rejects.toThrow("Circuit constraint failed: Voter commitment not found in eligibility Merkle tree");
  });
});