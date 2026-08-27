import { poseidonHash } from "./poseidon";

/**
 * Derives a deterministic cryptographic nullifier.
 * Nullifier = Poseidon("NULLIFIER", proposalId, voterSecret)
 *
 * Guarantees:
 * 1. Deterministic: The same voter voting on the same proposal always produces the identical nullifier.
 * 2. Unlinkable: Nullifiers for different proposals are cryptographically unrelated.
 * 3. Zero-Knowledge: Nullifier exposes 0 information about voter address or raw choice.
 */
export function deriveNullifier(proposalId: string, voterSecret: string): string {
  return poseidonHash(["NULLIFIER", proposalId, voterSecret]);
}

/**
 * Generates an encrypted vote commitment for tally auditability
 */
export function createBallotCommitment(choice: number, voterBlinding: string): string {
  return poseidonHash(["BALLOT", choice, voterBlinding]);
}