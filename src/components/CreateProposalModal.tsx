import React, { useState } from "react";
import { useVoting } from "../context/VotingContext";
import { X, Sparkles, Plus, Trash2, Shield, Calendar } from "lucide-react";

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({ isOpen, onClose }) => {
  const { createProposal } = useVoting();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Governance" | "Treasury" | "Protocol" | "Community">("Governance");
  const [options, setOptions] = useState<string[]>(["Approve Proposal", "Reject Proposal"]);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length >= 8) {
      setError("Maximum 8 options supported by the Midnight Compact circuit.");
      return;
    }
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setError("At least 2 options required for a ballot.");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Please fill out both proposal title and description.");
      return;
    }

    if (options.some((opt) => !opt.trim())) {
      setError("All option labels must be filled out.");
      return;
    }

    createProposal(title, description, category, options, durationDays * 86400);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0b101e] border border-indigo-900/80 shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
            COMPACT GOVERNANCE CIRCUIT
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            Create Shielded Governance Proposal
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Deploy a new confidential proposal directly to the Midnight on-chain ledger.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Proposal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., MIP-007: Integrate Confidential Lending Pool"
              className="w-full bg-slate-900/90 border border-indigo-950 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900/90 border border-indigo-950 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Governance">Governance</option>
                <option value="Treasury">Treasury</option>
                <option value="Protocol">Protocol</option>
                <option value="Community">Community</option>
              </select>
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full bg-slate-900/90 border border-indigo-950 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Proposal Description & Specification
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, architectural impact, and voting rationale..."
              className="w-full bg-slate-900/90 border border-indigo-950 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
            ></textarea>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold uppercase tracking-wider text-slate-400">
                Ballot Options ({options.length}/8)
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>

            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-center font-mono text-slate-500">{i + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleUpdateOption(i, e.target.value)}
                    className="flex-1 bg-slate-900/90 border border-indigo-950 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lunar flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Publish Proposal to Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};