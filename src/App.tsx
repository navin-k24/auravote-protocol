import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { ProposalCard } from "./components/ProposalCard";
import { CastVoteModal } from "./components/CastVoteModal";
import { CreateProposalModal } from "./components/CreateProposalModal";
import { HalfLightVisualizer } from "./components/HalfLightVisualizer";
import { EligibilityGate } from "./components/EligibilityGate";
import { PublicAuditLedger } from "./components/PublicAuditLedger";
import { PrivacyDocs } from "./components/PrivacyDocs";
import { useVoting } from "./context/VotingContext";
import { Proposal } from "./contracts/types";
import { Moon, Shield, Sparkles, Plus, ArrowRight, Layers, Lock, Unlock, CheckCircle2 } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("proposals");
  const [selectedProposalForVote, setSelectedProposalForVote] = useState<Proposal | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const { proposals, ledgerState } = useVoting();

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Proposals View */}
        {activeTab === "proposals" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1326] via-[#121b36] to-[#0d1326] border border-indigo-900/60 p-6 md:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  RISE IN MIDNIGHT PROGRAM • LEVEL 3 SUBMISSION
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Confidential Governance & Shielded Ballot dApp
                </h1>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Cast private, anonymous ballots with publicly verifiable tallies on the Midnight Network. 
                  Zero-knowledge proofs verify your DAO membership while ensuring your voter identity and raw choice remain mathematically confidential.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lunar flex items-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" /> Create Governance Proposal
                  </button>

                  <button
                    onClick={() => setActiveTab("visualizer")}
                    className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border border-indigo-900/60 font-semibold text-xs flex items-center gap-2 transition"
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    Open Half-Light Visualizer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Proposals Grid Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Active Proposals <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">{proposals.length}</span>
                </h2>
                <p className="text-xs text-slate-400">Cast your confidential zero-knowledge vote on open DAO ballots.</p>
              </div>
            </div>

            {/* Proposals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onCastVote={(prop) => setSelectedProposalForVote(prop)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Half-Light Visualizer */}
        {activeTab === "visualizer" && <HalfLightVisualizer />}

        {/* Tab 3: Eligibility Gate */}
        {activeTab === "eligibility" && <EligibilityGate />}

        {/* Tab 4: Public Audit */}
        {activeTab === "audit" && <PublicAuditLedger />}

        {/* Tab 5: Privacy Docs */}
        {activeTab === "docs" && <PrivacyDocs />}
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-950/40 bg-[#050811] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white">AURAVOTE PROTOCOL</span>
            <span className="text-slate-500">|</span>
            <span>Rise In Midnight Program Level 3</span>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <span>Compact Smart Contracts v0.20</span>
            <span>Plonk-UltraPlonk ZK Engine</span>
            <span>CI/CD Automated Tests</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProposalForVote && (
        <CastVoteModal
          proposal={selectedProposalForVote}
          onClose={() => setSelectedProposalForVote(null)}
        />
      )}

      <CreateProposalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};