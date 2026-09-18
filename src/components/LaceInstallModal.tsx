import React from "react";
import { X, ExternalLink, Shield, Wallet, Sparkles, CheckCircle2 } from "lucide-react";

interface LaceInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaceInstallModal: React.FC<LaceInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b101e] border border-indigo-900/80 shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-900 p-0.5 mx-auto shadow-lunar-glow">
            <div className="w-full h-full bg-[#070B14] rounded-[14px] flex items-center justify-center">
              <Wallet className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Midnight Lace Wallet Required</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
              AuraVote communicates with the Midnight Network via the official <strong>Midnight Lace DApp Connector</strong> for confidential zero-knowledge signatures.
            </p>
          </div>

          <div className="space-y-3 text-left text-xs bg-[#060a15] p-4 rounded-xl border border-indigo-950">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-indigo-900/80 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-white">Install Midnight Lace Extension</strong>
                <p className="text-[11px] text-slate-400">Download the preview release of the Midnight Lace browser extension.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-indigo-900/80 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-white">Switch to Midnight Devnet-Halo</strong>
                <p className="text-[11px] text-slate-400">Select the Devnet-Halo network inside Lace settings.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-indigo-900/80 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-white">Request Free Testnet tDUST Tokens</strong>
                <p className="text-[11px] text-slate-400">Use the official Midnight Devnet Faucet to fund your test wallet.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href="https://docs.midnight.network/develop/tutorial/building/prereqs#install-the-midnight-lace-wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lunar flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Get Midnight Lace
            </a>

            <a
              href="https://faucet.devnet.midnight.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-900/60 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Devnet Faucet
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
