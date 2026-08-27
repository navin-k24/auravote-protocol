# 🌙 Aetheris | Midnight Confidential Governance & Shielded Ballot dApp

[![CI/CD Pipeline](https://github.com/risein-midnight/aetheris-confidential-governance/actions/workflows/ci.yml/badge.svg)](https://github.com/risein-midnight/aetheris-confidential-governance/actions)
[![Tests Passing](https://img.shields.io/badge/Tests-8%2F8%20Passing-success?style=flat&logo=vitest)](https://vitest.dev)
[![Midnight Compact](https://img.shields.io/badge/Midnight-Compact%20v0.20-6366F1?style=flat)](https://midnight.network)
[![ZK Proofs](https://img.shields.io/badge/ZK--SNARKs-UltraPlonk-8B5CF6?style=flat)](https://midnight.network)
[![Rise In Level 3](https://img.shields.io/badge/Rise%20In-Level%203%20Submission-06B6D4?style=flat)](https://www.risein.com)

> *"Half light, half shadow — the truest picture of Midnight itself. Exactly half the moon is lit, and exactly as much of your app is disclosed as you decide."*

---

## 📌 Rise In Level 3 Submission Overview

This project is built for the **Rise In Midnight Program — Level 3 (First Quarter Submission)**.

- **Chosen Idea**: **Private Voting & Confidential Eligibility Gate** (*Aetheris Protocol*)
- **Core Innovation**: Anonymous zero-knowledge ballot casting with publicly verifiable tallies, deterministic nullifier replay protection, and an interactive **"Half-Light, Half-Shadow"** dual-state visualizer.
- **Smart Contract Language**: **Midnight Compact v0.20** (`contracts/PrivateVoting.compact`).
- **ZK Proof Engine**: Client-side UltraPlonk arithmetization and polynomial commitments over Poseidon algebraic hashes.

---

## 🔐 Privacy Model: What an Observer CAN and CANNOT Learn

### 🌑 What an Observer CANNOT Learn (The Shadow)
- **Voter Identity**: An observer cannot identify the wallet address, public key, or real identity of the voter.
- **Individual Ballot Choice**: An observer cannot determine which option any specific voter chose.
- **Token Holdings / Balance**: An observer cannot see the voter's raw balance or governance weight.
- **Cross-Proposal Correlation**: Votes cast by the same user across multiple proposals cannot be linked because nullifiers are salted per proposal ID.
- **Private Spending Keys**: Secret witness data is stored strictly in the voter's local device sandbox.

### 🌕 What an Observer CAN Learn (The Light)
- **Eligibility Verification**: Zero-knowledge proof that the voter is a valid leaf in the on-chain Merkle registry.
- **Replay Protection**: The public nullifier set registers each single-use nullifier to prevent double voting.
- **Aggregated Tallies**: Real-time publicly verifiable sum of votes per option.
- **Proposal Metadata**: Title, category, deadline timestamp, creation block height.
- **Cryptographic Auditability**: Anyone can verify the Plonk zk-SNARK proof on-chain.

---

## 🏛️ Architecture & Dual-State Design

```
┌─────────────────────────────────────────────────────────────┐
│                 THE SHADOW (Private Witness)                │
│  - Voter Secret Key (sk)                                    │
│  - Blinding Salt (r)                                        │
│  - Raw Ballot Choice (0..N)                                 │
│  - Merkle Tree Membership Path                              │
└──────────────────────────────┬──────────────────────────────┘
                               │ Client-side ZK-SNARK Prover
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             MIDNIGHT COMPACT CIRCUIT VERIFIER               │
│  - Circuit 1: Merkle Membership Check (Commitment in Tree)  │
│  - Circuit 2: Choice Bounds [0 <= choice < optionsCount]    │
│  - Circuit 3: Deterministic Nullifier Collision Check       │
└──────────────────────────────┬──────────────────────────────┘
                               │ State Transition
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  THE LIGHT (Public Ledger)                  │
│  - Nullifier Set (Spent Nullifiers)                         │
│  - On-Chain Voter Registry Root                             │
│  - Proposal State & Public Aggregate Tallies                │
│  - Public Audit Trail & Proof Hashes                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Suite & Verification (8/8 Passing)

The project includes 8 comprehensive automated tests across 4 test suites:

```bash
# Run the test suite
npm test
```

### Test Suite Breakdown:
1. `src/tests/circuits.test.ts` (3 tests):
   - Generates valid zk-SNARK proof for an authorized voter.
   - Rejects out-of-bounds ballot options via circuit constraint failure.
   - Rejects non-member voter attempting to forge Merkle proofs.
2. `src/tests/nullifier.test.ts` (3 tests):
   - Verifies deterministic nullifier derivation ($H(\text{proposal}, \text{secret})$).
   - Verifies cross-proposal nullifier unlinkability.
   - Rejects double-voting replay attempts on the Midnight ledger.
3. `src/tests/selectiveDisclosure.test.ts` (1 test):
   - Cryptographically verifies that public ledger logs contain 0 bits of private witness data.
4. `src/tests/contractTransitions.test.ts` (1 test):
   - Correctly accumulates anonymous votes across multiple voters and updates public tallies.

### Actual Test Run Output:
```text
 ✓ src/tests/selectiveDisclosure.test.ts (1 test)
 ✓ src/tests/circuits.test.ts (3 tests)
 ✓ src/tests/nullifier.test.ts (3 tests)
 ✓ src/tests/contractTransitions.test.ts (1 test)

 Test Files  4 passed (4)
      Tests  8 passed (8)
   Duration  3.06s
```

---

## 🔄 CI/CD Pipeline

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that automatically:
1. Sets up Node.js (18.x, 20.x, 22.x matrix).
2. Runs TypeScript typechecking & linting.
3. Executes the full automated Vitest test suite.
4. Compiles the Compact contract bindings and builds the production frontend.

---

## 🚀 Quickstart & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/risein-midnight/aetheris-confidential-governance.git
cd aetheris-confidential-governance

# 2. Install dependencies
npm install

# 3. Run the automated tests
npm test

# 4. Start the local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 📁 Repository Structure

```
midnight-level3-submission/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated CI/CD workflow
├── contracts/
│   ├── PrivateVoting.compact     # Official Midnight Compact smart contract
│   └── compiler.config.json      # Compact compiler & Plonk target config
├── src/
│   ├── crypto/                   # Cryptographic engine (Poseidon, Nullifier, Merkle, ZK Prover)
│   ├── contracts/                # Contract types & state machine simulator
│   ├── context/                  # WalletContext (Lace) & VotingContext
│   ├── components/               # Half-Light Visualizer, Cards, Modals, Audit Explorer
│   ├── tests/                    # 8 automated tests in 4 test suites
│   ├── App.tsx                   # Main tabbed application
│   └── main.tsx
├── docs/
│   ├── PRODUCT_PROPOSAL.md       # Rise In Level 3 submission proposal
│   ├── PRIVACY_MODEL.md          # In-depth selective disclosure specification
│   └── DEMO_SCRIPT.md            # 1-minute video demo script & narration
└── README.md
```

---

## 📋 Rise In Level 3 Submission Checklist

- [x] **Chosen Idea**: Private Voting & Confidential Eligibility Gate from the provided list.
- [x] **Midnight Privacy Model**: Meaningfully uses Midnight's dual-state architecture (Private Witness vs. Public Ledger).
- [x] **Passing Tests**: 8 tests passing (requirement: 3+).
- [x] **CI/CD Pipeline**: Configured in `.github/workflows/ci.yml` with test and build matrix.
- [x] **README Privacy Model Section**: Detailed "What an observer can and cannot learn" section included.
- [x] **Product Proposal**: Formal proposal included in `docs/PRODUCT_PROPOSAL.md`.
- [x] **Demo Video Guide**: Complete 1-minute narration script in `docs/DEMO_SCRIPT.md`.
- [x] **10+ Meaningful Commits**: Staged across modular git commits.