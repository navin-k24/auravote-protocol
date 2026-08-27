# 1-Minute Video Demo Script: Aetheris on Midnight

Use this script and step-by-step walkthrough to record your 1-minute submission demo video.

---

### Timing & Narration Breakdown

#### **0:00 - 0:10 | Introduction & Midnight Architecture**
> *"Hi everyone! This is Aetheris, a production-grade confidential governance dApp built on Midnight Network for the Rise In Level 3 submission. Aetheris embodies Midnight's 'Half light, half shadow' paradigm: private ballots with publicly verifiable tallies."*

#### **0:10 - 0:25 | Half-Light, Half-Shadow Visualizer**
> *(Navigate to the 'Half-Light Visualizer' tab)*
> *"Here in our Half-Light visualizer, we can inspect the strict boundary between private witness state on the client — like voter keys, secrets, and raw ballot choices in the shadow — and the public Midnight ledger in the light, where only deterministic nullifiers, Merkle roots, and aggregate tallies exist."*

#### **0:25 - 0:40 | Casting a Shielded Vote**
> *(Navigate to 'Governance Proposals' -> Click 'Cast Shielded Vote' on an active proposal)*
> *"Let's vote with Alice's identity. I select Option 1 and click 'Sign & Cast Shielded Vote'. Watch the real-time UltraPlonk ZK proof generation: it verifies Alice's Merkle eligibility, derives a unique nullifier, and submits the proof directly to our Compact circuit."*

#### **0:40 - 0:50 | Double-Voting Prevention & Public Audit**
> *(Attempt to vote again with Alice to show collision rejection, then switch to the 'Public Audit Ledger' tab)*
> *"If Alice tries to vote a second time, the Compact circuit rejects the transaction due to a nullifier collision. On the Public Audit Ledger, anyone can independently verify the zk-SNARK proofs on-chain."*

#### **0:50 - 1:00 | Tests & CI/CD Pipeline**
> *(Show terminal test output or GitHub Actions workflow)*
> *"All 8 automated test suites pass with 100% green status, backed by our continuous integration pipeline. Thank you!"*