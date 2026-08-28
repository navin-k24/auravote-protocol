**Track / Level**: Rise In Midnight Program — Level 3 (First Quarter Submission)  
**Live Demo URL**: [https://auravote-protocol.vercel.app/](https://auravote-protocol.vercel.app/)  
**Demo Video Link**: [Watch Video Demo on Google Drive](https://drive.google.com/file/d/1lLuIC7X7NHUvHs0B4wakGSdA2h2PRyk5/view?usp=sharing)  
**Selected Idea**: **Private Voting & Confidential Eligibility Gate**  
**Theme**: *"Half light, half shadow — the truest picture of Midnight itself."*

---

## 1. Problem Statement
Traditional decentralized autonomous organizations (DAOs) and on-chain governance systems face severe privacy and integrity problems due to full transparency:
1. **Voter Coercion & Bribery**: Transparent on-chain votes allow malicious actors to verify how a voter voted in exchange for bribes or retaliatory actions.
2. **Bandwagon & Herd Effect**: Early public voting results bias subsequent voters, distorting genuine governance sentiment.
3. **Whale Doxxing & Privacy Loss**: Token holders exposing their balances and voting records risk targeted phishing, physical extortion, and competitive exposure.
4. **Voter Apathy**: DAO participants frequently abstain from voting to avoid public conflict or social backlash.

---

## 2. The Solution: AuraVote on Midnight Network
**AuraVote** is a production-grade confidential voting and anonymous eligibility verification protocol built on Midnight's dual-state architecture and the **Compact** smart contract language.

AuraVote introduces **Selective Disclosure**:
- **Confidential Ballots**: Voters cast zero-knowledge ballots using client-side cryptographic witnesses without disclosing which option they voted for.
- **Anonymous Eligibility Gate**: Voters prove they belong to the eligible voter Merkle tree or hold sufficient governance stake without revealing their wallet address or balance.
- **Public Verifiability**: Anyone can verify the zero-knowledge Plonk proofs and inspect aggregate tallies on the public Midnight ledger.
- **Double-Voting Prevention**: Deterministic nullifiers ($N = \text{Poseidon}(\text{proposalId}, \text{voterSecret})$) guarantee that each eligible voter can vote exactly once per proposal without revealing who they are.

---

## 3. Midnight Privacy Model & Dual-State Architecture

| Layer | Domain | Midnight Component | Data Kept / Exposed |
| :--- | :--- | :--- | :--- |
| **Shadow (Private)** | Client Sandbox | `witness` | Voter Secret Key ($sk$), Blinding Salt ($r$), Raw Ballot Choice, Merkle Path |
| **Circuit Verification** | Zero-Knowledge Engine | `circuit` | UltraPlonk constraint enforcement, KZG polynomial commitment, Nullifier derivation |
| **Light (Public)** | On-Chain Blockchain | `ledger` | Proposal Metadata, Nullifier Registry (`Set<Bytes<32>>`), Aggregated Tallies, ZK Proof Hash |

---

## 4. Key Value Propositions
- **Coercion-Resistant**: Voters cannot prove to a briber which option they picked because individual ballots are not recorded on-chain.
- **Auditable & Tamper-Proof**: Every vote increments the public tally through verified mathematical circuit constraints.
- **Seamless Wallet Integration**: Native support for the **Midnight Lace Wallet** connector with fallback multi-account testnet identities.
- **Enterprise-Ready UI/UX**: Includes an interactive **"Half-Light, Half-Shadow" Visualizer** that demonstrates the cryptographic boundary in real time.

---

## 5. Technical Roadmap
- **Q1 (Current)**: Compact smart contract deployment, UltraPlonk circuit arithmetization, client-side proof generation, Lace connector, and CI/CD test automation.
- **Q2**: Multi-asset weighted quadratic voting with confidential token balances.
- **Q3**: Time-lock encrypted tally reveals and cross-chain governance bridge with Cardano.