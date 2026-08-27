# Midnight Privacy Model & Threat Analysis

*"Exactly half the moon is lit, and exactly as much of your app is disclosed as you decide."*

---

## 1. What an Observer CANNOT Learn (The Shadow)

An external observer, validator, node operator, or blockchain analyst inspecting transactions and ledger state on the Midnight blockchain **cannot** learn:

1. **Voter Identity & Public Address**:
   - The voter's wallet address, public key, or identity is never attached to a vote transaction.
   - Proof of membership in the voter registry is computed inside a zero-knowledge Merkle tree circuit.

2. **Individual Ballot Choice**:
   - The option chosen by a specific user (e.g., Option 1 vs. Option 2) is never stored or revealed on the public ledger.
   - The Compact circuit validates the choice in the private witness and increments the public tally without revealing the choice per user.

3. **Voter Balance or Token Holdings**:
   - Eligibility threshold proofs verify that a voter holds $\ge X$ governance weight without disclosing their exact balance.

4. **Cross-Proposal Correlation (Unlinkability)**:
   - Nullifiers are derived deterministically using both the proposal ID and voter secret:
     $$\text{Nullifier} = \text{Poseidon}(\text{proposalId}, \text{voterSecret})$$
   - Because the proposal ID is mixed in, nullifiers for the same voter on different proposals appear completely distinct and mathematically uncorrelated.

5. **Private Keys & Secrets**:
   - Spending keys and blinding salts are held in the client's local wallet memory and never transmitted.

---

## 2. What an Observer CAN Learn (The Light)

Any observer or validator on the Midnight blockchain **can** learn and verify:

1. **Proof Validity**:
   - An UltraPlonk zk-SNARK proof was submitted and verified by the Compact smart contract circuit against the current on-chain voter registry Merkle root.

2. **Single-Use Nullifier (Replay Protection)**:
   - The transaction publishes a 32-byte cryptographic nullifier.
   - The observer can confirm that this nullifier is recorded in the public ledger's nullifier set and has not been used before.

3. **Public Proposal Metadata**:
   - Proposal title, description, category, deadline timestamp, and creation block height.

4. **Aggregated Real-Time Tallies**:
   - Total number of votes cast for each option across the entire governance body.

5. **State Transition Integrity**:
   - The ledger state root and transaction history correctly reflect all validated state changes.

---

## 3. Cryptographic Primitives & Circuit Matrix

| Primitive | Role | Security Property |
| :--- | :--- | :--- |
| **Poseidon Hash** | Algebraic ZK-friendly hashing | Pre-image resistance & collision resistance over BN254 / BLS12-381 |
| **Merkle Tree (Depth 8)** | Anonymous Eligibility Registry | $O(\log N)$ membership proof with zero leaf identification |
| **Deterministic Nullifier** | Double-vote prevention | Unlinkable pseudonymity per proposal context |
| **Plonk / UltraPlonk** | Zero-Knowledge SNARK engine | Succinct verification ($O(1)$) with zero witness leakage |