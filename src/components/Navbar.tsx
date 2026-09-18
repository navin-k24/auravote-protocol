import React from "react";
import { useWallet } from "../context/WalletContext";
import { useVoting } from "../context/VotingContext";
import { Moon, Shield, Sparkles, Wallet, ChevronDown, Check, Coins, RefreshCw, ExternalLink, LogOut } from "lucide-react";
import { LaceInstallModal } from "./LaceInstallModal";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenCreateModal }) => {
  const { isConnected, isLaceInstalled, selectedAccount, connectWallet, disconnectWallet, openLaceInstallGuide, isInstallGuideOpen, closeInstallGuide } = useWallet();
  const { ledgerState, proposals, auditTrail, refreshLedger, isLoadingLedger } = useVoting();

  const tabs = [
    { id: "proposals", label: "Governance Proposals", count: proposals.length },
    { id: "visualizer", label: "Half-Light Visualizer", highlight: true },
    { id: "eligibility", label: "Eligibility Gate" },
    { id: "audit", label: "Public Audit Ledger", count: auditTrail.length },
    { id: "docs", label: "Privacy Spec" }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-indigo-950/40 bg-[#070B14]/85 backdrop-blur-xl">
        {/* Top Network Status Banner */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-indigo-950/60 border-b border-indigo-900/30 px-4 py-1.5 text-xs text-indigo-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              MIDNIGHT DEVNET-HALO
            </span>
            <span className="text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-300 font-mono text-[11px]">Compact v0.20</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Block #{ledgerState?.currentBlockHeight || 142100}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1.5 text-slate-300 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Shielded Ballots: <strong className="text-white">{ledgerState?.totalShieldedVotesCast || 0}</strong> cast
            </span>
            <button
              onClick={() => refreshLedger()}
              disabled={isLoadingLedger}
              title="Sync with Midnight Ledger"
              className="hover:text-white transition-colors flex items-center gap-1 text-[11px] text-slate-400"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingLedger ? "animate-spin text-indigo-400" : ""}`} />
              Sync Ledger
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("proposals")}>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-900 p-0.5 shadow-lunar-glow">
                <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-900/40 to-indigo-500/40"></div>
                  <Moon className="w-5 h-5 text-indigo-400 relative z-10" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent">
                    AURAVOTE
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-indigo-950 border border-indigo-700/50 text-indigo-300">
                    MIDNIGHT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Confidential Governance on Midnight Network</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                  } ${tab.highlight ? "relative" : ""}`}
                >
                  {tab.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                  )}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-800/80 text-[10px] text-slate-400 border border-slate-700/50">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Actions & Wallet Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onOpenCreateModal}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm hover:shadow-lunar flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Proposal</span>
              </button>

              {/* Midnight Lace Wallet Button */}
              {isConnected && selectedAccount ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-indigo-900/50 text-xs text-slate-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <div className="text-left max-w-[120px] sm:max-w-[150px] truncate">
                      <span className="font-semibold block truncate">{selectedAccount.address.slice(0, 10)}...{selectedAccount.address.slice(-4)}</span>
                      <span className="text-[10px] text-indigo-400 block font-mono">
                        {selectedAccount.balance.toFixed(2)} tDUST
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    title="Disconnect Wallet"
                    className="p-2 rounded-lg bg-slate-900/80 hover:bg-rose-950/60 border border-indigo-950 text-slate-400 hover:text-rose-400 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => connectWallet().catch(() => openLaceInstallGuide())}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400/40 shadow-lunar flex items-center gap-1.5 transition"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Connect Midnight Lace
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation bar */}
          <div className="lg:hidden flex items-center gap-1 pb-3 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40"
                    : "text-slate-400 hover:bg-slate-800/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Lace Install Helper Modal */}
      <LaceInstallModal isOpen={isInstallGuideOpen} onClose={closeInstallGuide} />
    </>
  );
};