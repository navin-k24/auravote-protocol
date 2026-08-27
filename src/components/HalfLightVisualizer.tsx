import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useVoting } from "../context/VotingContext";
import { deriveNullifier, createBallotCommitment } from "../crypto/nullifier";
import { Shield, Eye, EyeOff, Lock, Unlock, Key, FileCheck, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export const HalfLightVisualizer: React.FC = () => {
  const { selectedAccount, accounts, selectAccount, merkleTree, voterRegistryRoot } = useWallet();
  const { proposals, ledgerState, lastGeneratedProof } = useVoting();
  
  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    proposals[0]?.id || ""
  );
  const [simulatedChoice, setSimulatedChoice] = useState<number>(0);
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);

  const currentProposal = proposals.find((p) => p.id === selectedProposalId) || proposals[0];

  const simulatedNullifier = selectedAccount && currentProposal
    ? deriveNullifier(currentProposal.id, selectedAccount.secretKey)
    : "0x0000000000000000000000000000000000000000000000000000000000000000";

  const simulatedBallotCommitment = selectedAccount
    ? createBallotCommitment(simulatedChoice, selectedAccount.blindingFactor)
    : "0x0000000000000000000000000000000000000000000000000000000000000000";

  const isAlreadyVoted = ledgerState.nullifiers.includes(simulatedNullifier);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1326] via-[#121b36] to-[#0d1326] border border-indigo-900/60 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            MIDNIGHT DUAL-STATE ARCHITECTURE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Half Light, Half Shadow Visualizer
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Exactly half the moon is lit, and exactly as much of your dApp is disclosed as you decide. 
            Inspect the strict boundary between client-side private witness state (Shadow) and the publicly verifiable Midnight blockchain state (Light).
          </p>
        </div>

        {/* Live Controls */}
        <div className="mt-6 pt-6 border-t border-indigo-900/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Active Identity (Client)
            </label>
            <select
              value={accounts.findIndex((a) => a.address === selectedAccount?.address)}
              onChange={(e) => selectAccount(Number(e.target.value))}
              className="w-full bg-slate-900/90 border border-indigo-900/70 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {accounts.map((acc, idx) => (
                <option key={acc.address} value={idx}>
                  {acc.name} ({acc.balance.toFixed(0)} tDUST)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Target Proposal
            </label>
            <select
              value={selectedProposalId}
              onChange={(e) => setSelectedProposalId(e.target.value)}
              className="w-full bg-slate-900/90 border border-indigo-900/70 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium truncate"
            >
              {proposals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Simulated Private Choice
            </label>
            <select
              value={simulatedChoice}
              onChange={(e) => setSimulatedChoice(Number(e.target.value))}
              className="w-full bg-slate-900/90 border border-indigo-900/70 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {currentProposal?.options.map((opt, idx) => (
                <option key={idx} value={idx}>
                  Option {idx + 1}: {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Split-View: Shadow vs Light */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHADOW PANEL (Private State) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#090d18] to-[#070a13] border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 shadow-inner">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  THE SHADOW <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">Private Witness</span>
                </h3>
                <p className="text-xs text-slate-400">Kept inside voter's local device sandbox. Never broadcast.</p>
              </div>
            </div>
            <button
              onClick={() => setShowSecretKey(!showSecretKey)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
            >
              {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showSecretKey ? "Hide Secrets" : "Reveal Secrets"}
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Secret Key */}
            <div className="p-3 rounded-xl bg-[#04060b] border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-sans">
                <span className="flex items-center gap-1 font-semibold text-purple-300">
                  <Key className="w-3 h-3" /> 1. Voter Private Spending Key (sk)
                </span>
                <span className="text-[10px] text-rose-400 font-medium">NEVER EXPOSED</span>
              </div>
              <p className="text-slate-300 break-all bg-black/40 p-2 rounded border border-slate-900">
                {showSecretKey ? selectedAccount?.secretKey : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
              </p>
            </div>

            {/* Blinding Factor */}
            <div className="p-3 rounded-xl bg-[#04060b] border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-sans">
                <span className="flex items-center gap-1 font-semibold text-purple-300">
                  <Shield className="w-3 h-3" /> 2. Cryptographic Blinding Factor (r)
                </span>
                <span className="text-[10px] text-rose-400 font-medium">SECRET SALT</span>
              </div>
              <p className="text-slate-300 break-all bg-black/40 p-2 rounded border border-slate-900">
                {showSecretKey ? selectedAccount?.blindingFactor : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
              </p>
            </div>

            {/* Raw Choice */}
            <div className="p-3 rounded-xl bg-[#04060b] border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-sans">
                <span className="font-semibold text-purple-300">3. Raw Ballot Selection</span>
                <span className="text-[10px] text-emerald-400 font-medium">ZERO-KNOWLEDGE WITNESS</span>
              </div>
              <div className="bg-purple-950/30 p-2.5 rounded border border-purple-900/40 text-purple-200 font-sans">
                <span className="font-bold text-white">Index {simulatedChoice}: </span>
                {currentProposal?.options[simulatedChoice]?.label || "No option selected"}
              </div>
            </div>

            {/* Merkle Witness Path */}
            <div className="p-3 rounded-xl bg-[#04060b] border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-sans">
                <span className="font-semibold text-purple-300">4. Merkle Membership Path (Proof)</span>
                <span className="text-[10px] text-indigo-400 font-medium">TREE DEPTH 8</span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Voter Index: <strong className="text-white">#{selectedAccount?.merkleIndex}</strong> in Merkle Registry.
              </p>
              <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">
                Sibling 0: {merkleTree.getProof(selectedAccount?.merkleIndex || 0).path[0]}
              </div>
            </div>
          </div>
        </div>

        {/* LIGHT PANEL (Public State) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0e1629] to-[#090f1d] border border-indigo-900/60 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-indigo-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shadow-inner">
                <Unlock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  THE LIGHT <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">Public Ledger</span>
                </h3>
                <p className="text-xs text-slate-400">Verifiable by every validator & observer on Midnight.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" /> VERIFIABLE
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Deterministic Nullifier */}
            <div className="p-3 rounded-xl bg-[#070c18] border border-indigo-950">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-sans">
                <span className="flex items-center gap-1 font-semibold text-indigo-300">
                  <FileCheck className="w-3 h-3" /> 1. Deterministic Nullifier (Bytes&lt;32&gt;)
                </span>
                {isAlreadyVoted ? (
                  <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> SPENT (VOTED)
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold">UNSPENT (READY)</span>
                )}
              </div>
              <p className="text-indigo-200 break-all bg-indigo-950/30 p-2 rounded border border-indigo-900/40">
                {simulatedNullifier}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                Prevents double voting without revealing who cast the vote.
              </p>
            </div>

            {/* Public Voter Registry Root */}
            <div className="p-3 rounded-xl bg-[#070c18] border border-indigo-950">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-sans">
                <span className="font-semibold text-indigo-300">2. On-Chain Voter Registry Root</span>
                <span className="text-[10px] text-slate-400 font-medium">MERKLE ROOT</span>
              </div>
              <p className="text-slate-300 break-all bg-indigo-950/30 p-2 rounded border border-indigo-900/40">
                {voterRegistryRoot}
              </p>
            </div>

            {/* Public Proposal Aggregates */}
            <div className="p-3 rounded-xl bg-[#070c18] border border-indigo-950">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-sans">
                <span className="font-semibold text-indigo-300">3. Aggregated Vote Tally</span>
                <span className="text-[10px] text-indigo-400 font-medium font-mono">
                  {currentProposal?.totalVotes || 0} TOTAL VOTES
                </span>
              </div>
              <div className="space-y-1.5 mt-2 font-sans">
                {currentProposal?.options.map((opt, i) => {
                  const pct = currentProposal.totalVotes > 0
                    ? Math.round((opt.voteCount / currentProposal.totalVotes) * 100)
                    : 0;
                  return (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-900/70 px-2 py-1 rounded">
                      <span className="text-slate-300 truncate max-w-[200px]">{opt.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-300 font-mono font-semibold">{opt.voteCount}</span>
                        <span className="text-[10px] text-slate-400 w-8 text-right">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plonk SNARK Proof Hash */}
            <div className="p-3 rounded-xl bg-[#070c18] border border-indigo-950">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-sans">
                <span className="font-semibold text-indigo-300">4. Latest zk-SNARK Proof Hash</span>
                <span className="text-[10px] text-emerald-400 font-medium">PLONK VERIFIED</span>
              </div>
              <p className="text-slate-400 break-all bg-indigo-950/30 p-2 rounded border border-indigo-900/40 text-[11px]">
                {lastGeneratedProof?.proofHash || "0x98f2a1b9201f8d37c8e9281a9823f09823b4982a7f8e91d09283f472891b9283"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selective Disclosure Matrix Table */}
      <div className="rounded-2xl bg-[#090d18] border border-indigo-950 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">
            Selective Disclosure Guarantees Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-indigo-950 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Information Domain</th>
                <th className="py-3 px-4">Shadow (Private Client)</th>
                <th className="py-3 px-4">Light (Public Ledger)</th>
                <th className="py-3 px-4">Cryptographic Enforcement</th>
                <th className="py-3 px-4 text-right">Privacy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Voter Identity</td>
                <td className="py-3 px-4 font-mono text-purple-300">Secret Key + Address</td>
                <td className="py-3 px-4 font-mono text-slate-400">HIDDEN (Zero Leak)</td>
                <td className="py-3 px-4">Merkle Tree Zero-Knowledge Membership Circuit</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/50">
                    100% Confidential
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Ballot Choice per User</td>
                <td className="py-3 px-4 font-mono text-purple-300">Option Index (0..N)</td>
                <td className="py-3 px-4 font-mono text-slate-400">HIDDEN (Zero Leak)</td>
                <td className="py-3 px-4">Pedersen Commitment + Plonk Arithmetization</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/50">
                    100% Confidential
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Double-Voting Prevention</td>
                <td className="py-3 px-4 font-mono text-purple-300">H(Proposal, Secret)</td>
                <td className="py-3 px-4 font-mono text-indigo-300">Public Nullifier Set</td>
                <td className="py-3 px-4">Deterministic Poseidon Hash Nullifier Collision Check</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800/50">
                    Publicly Enforced
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Public Vote Tally</td>
                <td className="py-3 px-4 font-mono text-slate-400">Aggregated with network</td>
                <td className="py-3 px-4 font-mono text-indigo-300">Sum per Option</td>
                <td className="py-3 px-4">Compact State Transition Vector Accumulator</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800/50">
                    Publicly Verifiable
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};