import { describe, it, expect } from "vitest";
import { PrivateVotingContract } from "../../contracts/managed/PrivateVoting/contract";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment } from "../crypto/poseidon";
import { PrivateWitness } from "../midnight/types";

describe("Midnight Compact Circuits & Witness Evaluation", () => {
  it("evaluates valid witness constraints for an eligible voter", async () => {
    const tree = new MerkleTree(8);
    const secretKey = "0x1111111111111111111111111111111111111111111111111111111111111111";
    const blinding = "0x2222222222222222222222222222222222222222222222222222222222222222";
    const commitment = createVoterCommitment(secretKey, blinding);
    const leafIndex = tree.insertLeaf(commitment);
    const root = tree.getRoot();

    const contract = new PrivateVotingContract();
    contract.initializeRegistry(root, "0x0000000000000000000000000000000000000000000000000000000000000001");

    const now = Date.now();
    const propId = "0xprop001";
    contract.createProposal(propId, "Test Circuit", "Desc", 3, root, now + 100000, now);

    const witness: PrivateWitness = {
      voterSecret: secretKey,
      voterBlinding: blinding,
      rawChoice: 0,
      merklePath: tree.getProof(leafIndex).path,
      merkleIndices: tree.getProof(leafIndex).indices
    };

    const result = contract.castShieldedVote(propId, root, now + 1, witness);
    expect(result.success).toBe(true);
    expect(result.nullifier.startsWith("0x")).toBe(true);
  });

  it("fails when choice is out of allowable options bounds", async () => {
    const tree = new MerkleTree(8);
    const secretKey = "0x1111111111111111111111111111111111111111111111111111111111111111";
    const blinding = "0x2222222222222222222222222222222222222222222222222222222222222222";
    const commitment = createVoterCommitment(secretKey, blinding);
    const leafIndex = tree.insertLeaf(commitment);
    const root = tree.getRoot();

    const contract = new PrivateVotingContract();
    contract.initializeRegistry(root, "0x0000000000000000000000000000000000000000000000000000000000000001");

    const now = Date.now();
    const propId = "0xprop002";
    contract.createProposal(propId, "Test Bounds", "Desc", 3, root, now + 100000, now);

    const witness: PrivateWitness = {
      voterSecret: secretKey,
      voterBlinding: blinding,
      rawChoice: 5, // optionsCount is 3, choice 5 is invalid
      merklePath: tree.getProof(leafIndex).path,
      merkleIndices: tree.getProof(leafIndex).indices
    };

    expect(() =>
      contract.castShieldedVote(propId, root, now + 1, witness)
    ).toThrow("Invalid choice selected");
  });

  it("fails when voter commitment is not in the Merkle tree registry", async () => {
    const tree = new MerkleTree(8);
    tree.insertLeaf("0x9999999999999999999999999999999999999999999999999999999999999999");
    const root = tree.getRoot();

    const contract = new PrivateVotingContract();
    contract.initializeRegistry(root, "0x0000000000000000000000000000000000000000000000000000000000000001");

    const now = Date.now();
    const propId = "0xprop003";
    contract.createProposal(propId, "Test Merkle", "Desc", 3, root, now + 100000, now);

    const unauthorizedSecret = "0xunauthorized0000000000000000000000000000000000000000000000000001";
    const unauthorizedBlinding = "0xblind000000000000000000000000000000000000000000000000000000000001";

    const witness: PrivateWitness = {
      voterSecret: unauthorizedSecret,
      voterBlinding: unauthorizedBlinding,
      rawChoice: 1,
      merklePath: tree.getProof(0).path,
      merkleIndices: tree.getProof(0).indices
    };

    expect(() =>
      contract.castShieldedVote(propId, root, now + 1, witness)
    ).toThrow("Voter not eligible or invalid Merkle proof");
  });
});