import React, { useState } from "react";
import { Proposal } from "../contracts/types";
import { useWallet } from "../context/WalletContext";
import { useVoting } from "../context/VotingContext";
import { ZkProof } from "../crypto/zkProofEngine";
import { Shield, Lock, Sparkles, CheckCircle2, AlertCircle, X, ArrowRight, Loader2, Cpu, Key, FileCheck } from "lucide-react";

interface CastVoteModalProps {
  proposal: Proposal | null;
  onClose: () => void;
}

export const CastVoteModal: React.FC<CastVoteModalProps> = ({ proposal, onClose }) => {
  const { selectedAccount } = useWallet();
  const { castVote, isVoting, currentProofProgress } = useVoting();

  const [selectedChoice, setSelectedChoice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [successProof, setSuccessProof] = useState<ZkProof | null>(null);

  if (!proposal) return null;

  const handleSubmitVote = async () => {
    setError(null);
    try {
      const result = await castVote(proposal.id, selectedChoice);
      setSuccessProof(result.proof);
    } catch (err: any) {
      setError(err.message || "Failed to generate ZK proof or commit vote.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b101e] border border-indigo-900/80 shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success View */}
        {successProof ? (
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lunar">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Shielded Ballot Cast Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Your vote was synthesized into an UltraPlonk zero-knowledge proof and verified by the Midnight Compact circuit.
              </p>
            </div>

            {/* Proof Digest */}
            <div className="bg-[#050811] p-4 rounded-xl border border-indigo-950 text-left text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Deterministic Nullifier:</span>
                <span className="text-emerald-400 font-semibold">VERIFIED & SPENT</span>
              </div>
              <p className="text-slate-300 break-all text-[11px] bg-slate-900/80 p-2 rounded">
                {successProof.publicInputs.nullifier}
              </p>

              <div className="flex items-center justify-between text-slate-400 pt-1">
                <span>Plonk Proof Digest:</span>
                <span className="text-indigo-400 font-semibold">ON-CHAIN</span>
              </div>
              <p className="text-slate-300 break-all text-[11px] bg-slate-900/80 p-2 rounded">
                {successProof.proofHash}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lunar transition"
              >
                Done & Return to Governance
              </button>
            </div>
          </div>
        ) : (
          /* Voting Form View */
          <div className="space-y-5">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                MIDNIGHT ZERO-KNOWLEDGE BALLOT
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                {proposal.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select your confidential option below. The Compact circuit guarantees your identity and choice remain 100% hidden.
              </p>
            </div>

            {/* Active Voter Sandbox */}
            <div className="p-3 rounded-xl bg-[#070b16] border border-indigo-950 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="font-semibold text-white block">{selectedAccount?.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Merkle Leaf #{selectedAccount?.merkleIndex}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/40">
                {selectedAccount?.balance.toFixed(0)} tDUST
              </span>
            </div>

            {/* Choice Radios */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Select Your Confidential Ballot Choice
              </label>
              {proposal.options.map((option, idx) => (
                <label
                  key={idx}
                  onClick={() => setSelectedChoice(idx)}
                  className={`w-full p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                    selectedChoice === idx
                      ? "bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedChoice === idx ? "border-indigo-400 bg-indigo-600" : "border-slate-600"
                    }`}>
                      {selectedChoice === idx && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <span>{option.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Option {idx + 1}</span>
                </label>
              ))}
            </div>

            {/* ZK Proof Progress Bar (when active) */}
            {isVoting && currentProofProgress && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    {currentProofProgress.step}
                  </span>
                  <span className="font-mono">{currentProofProgress.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${currentProofProgress.percentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <p>{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isVoting}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitVote}
                disabled={isVoting}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lunar flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {isVoting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating Proof...
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    Sign & Cast Shielded Vote
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};