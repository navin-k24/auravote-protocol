import React from "react";
import { Shield, Lock, Eye, EyeOff, FileText, CheckCircle2, AlertCircle, Sparkles, Terminal, Code } from "lucide-react";

export const PrivacyDocs: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d1326] via-[#121b36] to-[#0d1326] border border-indigo-900/60 p-6 md:p-8 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-3">
          <FileText className="w-3.5 h-3.5" />
          MIDNIGHT PRIVACY MODEL SPECIFICATION
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Privacy Architecture & Threat Model
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Midnight is engineered around the principle of selective disclosure: <span className="italic text-indigo-300">"Half light, half shadow"</span>. 
          Below is the formal specification of what an observer or validator on the Midnight blockchain can and cannot learn.
        </p>
      </div>

      {/* Side-by-side: Can vs Cannot Learn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What an observer CANNOT learn */}
        <div className="rounded-2xl bg-[#090d18] border border-purple-950 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-base pb-3 border-b border-purple-950">
            <EyeOff className="w-5 h-5 text-purple-400" />
            <h3>What an Observer CANNOT Learn (Shadow)</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
              <span><strong>Voter Identity:</strong> An observer cannot determine the wallet address, public key, or real-world identity of the voter who cast a given ballot.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
              <span><strong>Individual Ballot Choice:</strong> An observer cannot link a voter or transaction to any specific option (Yes, No, Abstain).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
              <span><strong>Token Balance or Governance Weight:</strong> An observer cannot see how many tokens or voting weight the voter holds.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
              <span><strong>Cross-Proposal Linkability:</strong> An observer cannot correlate votes cast by the same user across different proposals because nullifiers are pseudo-randomly salted per proposal ID.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
              <span><strong>Private Spending Key &amp; Blinding:</strong> Secret witnesses are kept strictly inside the voter's local device sandbox.</span>
            </li>
          </ul>
        </div>

        {/* What an observer CAN learn */}
        <div className="rounded-2xl bg-[#090d18] border border-indigo-950 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-base pb-3 border-b border-indigo-950">
            <Eye className="w-5 h-5 text-indigo-400" />
            <h3>What an Observer CAN Learn (Light)</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
              <span><strong>Valid Eligibility:</strong> An observer can verify that the voter is a member of the authorized eligibility Merkle tree via zero-knowledge proof.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
              <span><strong>One Vote Per Proposal (Replay Protection):</strong> An observer can see that a unique nullifier was spent in the public nullifier set, proving no double voting took place.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
              <span><strong>Aggregated Public Tallies:</strong> An observer can see the real-time sum of votes per option without knowing which voter contributed to which tally.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
              <span><strong>Proposal Metadata &amp; Status:</strong> Title, description, voting deadline, creation timestamp, and total ballots cast.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
              <span><strong>zk-SNARK Proof Validity:</strong> Anyone can verify the Plonk algebraic proof against the Midnight on-chain state root.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Compact Code Preview */}
      <div className="rounded-2xl bg-[#090d18] border border-indigo-950 p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-950">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <Code className="w-4 h-4" />
            <span>Compact Smart Contract Circuit: <code className="text-white font-mono">contracts/PrivateVoting.compact</code></span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Midnight Compact v0.20</span>
        </div>

        <pre className="p-4 rounded-xl bg-[#04060b] border border-slate-900 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`// Confidential Ballot Casting Circuit in Compact
export circuit castShieldedVote(
  proposalId: Bytes<32>,
  publicRoot: Bytes<32>,
  currentTime: Uint<64>
): Void {
  // Read proposal from public ledger (Light)
  assert(ledger.proposals.member(proposalId), "Proposal does not exist");
  var prop: Proposal = ledger.proposals.lookup(proposalId);
  assert(prop.status == ProposalStatus.Active, "Proposal is not active");

  // Read private witness state from local client (Shadow)
  var secret: Bytes<32> = witness.voterSecret;
  var choice: Uint<8> = witness.rawChoice;
  var blinding: Bytes<32> = witness.voterBlinding;

  // Constraint 1: Choice boundary check
  assert(choice < prop.optionsCount, "Invalid choice selected");

  // Constraint 2: Verify Merkle Membership Proof
  var voterCommitment: Bytes<32> = poseidonHash2(secret, blinding);
  var computedRoot: Bytes<32> = computeMerkleRoot(voterCommitment, witness.merklePath, witness.merkleIndices);
  assert(computedRoot == prop.voterRegistryRoot, "Voter not in eligible Merkle tree");

  // Constraint 3: Derive deterministic nullifier
  var nullifier: Bytes<32> = poseidonHash2(proposalId, secret);
  assert(!ledger.nullifiers.member(nullifier), "Double-voting attempt rejected");

  // Update public ledger state
  ledger.nullifiers.insert(nullifier);
  prop.votesPerOption[choice] = prop.votesPerOption[choice] + 1;
  prop.totalVotes = prop.totalVotes + 1;
  ledger.proposals.insert(proposalId, prop);
  ledger.totalShieldedVotesCast = ledger.totalShieldedVotesCast + 1;
}`}
        </pre>
      </div>
    </div>
  );
};