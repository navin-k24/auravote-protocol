import React from "react";
import { Proposal } from "../contracts/types";
import { useWallet } from "../context/WalletContext";
import { useVoting } from "../context/VotingContext";
import { deriveNullifier } from "../crypto/nullifier";
import { Clock, Shield, CheckCircle2, AlertCircle, ChevronRight, Users, Check } from "lucide-react";

interface ProposalCardProps {
  proposal: Proposal;
  onCastVote: (proposal: Proposal) => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onCastVote }) => {
  const { selectedAccount } = useWallet();
  const { ledgerState } = useVoting();

  const userNullifier = selectedAccount
    ? deriveNullifier(proposal.id, selectedAccount.secretKey)
    : "";

  const hasUserVoted = ledgerState.nullifiers.includes(userNullifier);
  const isExpired = Date.now() > proposal.deadline;

  const categoryColors = {
    Governance: "bg-purple-950/80 text-purple-300 border-purple-800/60",
    Treasury: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
    Protocol: "bg-indigo-950/80 text-indigo-300 border-indigo-800/60",
    Community: "bg-amber-950/80 text-amber-300 border-amber-800/60"
  };

  const timeLeftDays = Math.max(0, Math.ceil((proposal.deadline - Date.now()) / (1000 * 86400)));

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0c1222] to-[#080d18] border border-indigo-950/80 hover:border-indigo-800/60 transition-all duration-300 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group">
      {/* Top Tag & Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${categoryColors[proposal.category] || categoryColors.Governance}`}>
            {proposal.category}
          </span>

          <div className="flex items-center gap-2">
            {hasUserVoted && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Shielded Vote Cast
              </span>
            )}

            {isExpired ? (
              <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Closed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">
                <Clock className="w-3 h-3" /> {timeLeftDays}d left
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2">
          {proposal.title}
        </h3>
        <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {proposal.description}
        </p>

        {/* Options Progress */}
        <div className="mt-5 space-y-2.5">
          {proposal.options.map((option, idx) => {
            const percentage = proposal.totalVotes > 0
              ? Math.round((option.voteCount / proposal.totalVotes) * 100)
              : 0;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[240px]">
                    {option.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">{option.voteCount} votes</span>
                    <span className="text-indigo-400 font-mono font-semibold text-[11px] w-8 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer stats & Action */}
      <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span><strong className="text-white font-mono">{proposal.totalVotes}</strong> Anonymous Ballots</span>
        </div>

        <button
          onClick={() => onCastVote(proposal)}
          disabled={hasUserVoted || isExpired}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            hasUserVoted
              ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
              : isExpired
              ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-lunar"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          {hasUserVoted ? "Already Voted" : isExpired ? "Voting Ended" : "Cast Shielded Vote"}
          {!hasUserVoted && !isExpired && <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};