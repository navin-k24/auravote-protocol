import React, { useState } from "react";
import { useVoting } from "../context/VotingContext";
import { OnChainTransactionAudit } from "../midnight/types";
import { MIDNIGHT_CONFIG } from "../midnight/config";
import { Shield, FileCheck, Search, RefreshCw, Layers, ExternalLink } from "lucide-react";
import { ProofVerifierModal } from "./ProofVerifierModal";

export const PublicAuditLedger: React.FC = () => {
  const { ledgerState, auditTrail, refreshLedger, isLoadingLedger } = useVoting();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecordForProof, setSelectedRecordForProof] = useState<OnChainTransactionAudit | null>(null);

  const filtered = auditTrail.filter(
    (rec) =>
      (rec.proposalTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.nullifier || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.proofHash || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.txId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d1326] via-[#121b36] to-[#0d1326] border border-indigo-900/60 p-6 md:p-8 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-3">
          <FileCheck className="w-3.5 h-3.5" />
          ON-CHAIN PROOF VERIFIER & TRANSACTION EXPLORER
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Public Ledger Audit Trail
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Every shielded ballot casts a zero-knowledge SNARK proof and spends a deterministic nullifier recorded on the Midnight Ledger. 
          Auditors and community members can independently verify proof validity without ever learning who voted or which option was selected.
        </p>

        {/* Global Stats */}
        <div className="mt-6 pt-6 border-t border-indigo-900/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-950">
            <span className="text-slate-400 block text-[10px] font-sans uppercase">Total Shielded Votes</span>
            <span className="text-lg font-bold text-white">{ledgerState?.totalShieldedVotesCast || 0}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-950">
            <span className="text-slate-400 block text-[10px] font-sans uppercase">Nullifiers Spent</span>
            <span className="text-lg font-bold text-indigo-400">{ledgerState?.nullifiers.length || 0}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-950">
            <span className="text-slate-400 block text-[10px] font-sans uppercase">Contract Address</span>
            <span className="text-xs font-bold text-purple-400 block truncate">
              {MIDNIGHT_CONFIG.contractAddress.slice(0, 10)}...{MIDNIGHT_CONFIG.contractAddress.slice(-6)}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-950">
            <span className="text-slate-400 block text-[10px] font-sans uppercase">Verification Engine</span>
            <span className="text-lg font-bold text-emerald-400">Plonk-UltraPlonk</span>
          </div>
        </div>
      </div>

      {/* Search & Audit Table */}
      <div className="rounded-2xl bg-[#090d18] border border-indigo-950 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by circuit, nullifier, proof..."
              className="w-full bg-slate-900/90 border border-indigo-950 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => refreshLedger()}
            disabled={isLoadingLedger}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoadingLedger ? "animate-spin" : ""}`} />
            Refresh Ledger State
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>No audit records found. Cast your first shielded vote to generate on-chain proof logs!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-indigo-950 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Tx / Block</th>
                  <th className="py-3 px-4">Circuit Action</th>
                  <th className="py-3 px-4">Deterministic Nullifier</th>
                  <th className="py-3 px-4">Proof Digest</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 font-mono text-slate-300">
                {filtered.map((rec) => (
                  <tr key={rec.txId} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <span className="text-indigo-400 font-semibold block">{rec.txId.slice(0, 10)}...</span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        Block #{rec.blockHeight} • {new Date(rec.timestamp).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans max-w-[200px] truncate text-white font-medium">
                      <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/40 text-[11px] text-indigo-300">
                        {rec.circuitName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {rec.nullifier ? (
                        <span className="bg-black/40 px-2 py-1 rounded border border-slate-800 text-[11px]">
                          {rec.nullifier.slice(0, 18)}...
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px] font-sans">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {rec.proofHash ? (
                        <span className="bg-black/40 px-2 py-1 rounded border border-slate-800 text-[11px]">
                          {rec.proofHash.slice(0, 18)}...
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px] font-sans">State Transition</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedRecordForProof(rec)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 text-[11px] font-medium transition inline-flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" /> Verify Proof
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proof Verifier Modal */}
      {selectedRecordForProof && (
        <ProofVerifierModal
          record={selectedRecordForProof}
          onClose={() => setSelectedRecordForProof(null)}
        />
      )}
    </div>
  );
};