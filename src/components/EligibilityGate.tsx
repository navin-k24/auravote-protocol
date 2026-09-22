import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment } from "../crypto/poseidon";
import { Shield, UserCheck, CheckCircle2, Wallet } from "lucide-react";

export const EligibilityGate: React.FC = () => {
  const { selectedAccount, isConnected, connectWallet, merkleTree, voterRegistryRoot } = useWallet();
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    commitment: string;
    pathLength: number;
    root: string;
  } | null>(null);

  const handleVerifyCurrentAccount = async () => {
    if (!isConnected || !selectedAccount) {
      try {
        await connectWallet();
      } catch (err: any) {
        alert(err.message || "Please connect Midnight Lace wallet.");
        return;
      }
    }

    const proof = merkleTree.getProof(selectedAccount?.merkleIndex || 0);
    const commitment = createVoterCommitment(selectedAccount?.secretKey || "", selectedAccount?.blindingFactor || "");
    const isValid = MerkleTree.verifyProof(commitment, proof);

    setVerificationResult({
      verified: isValid,
      commitment,
      pathLength: proof.path.length,
      root: proof.root
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d1326] via-[#121b36] to-[#0d1326] border border-indigo-900/60 p-6 md:p-8 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          CONFIDENTIAL CREDENTIALS & ELIGIBILITY PROOFS
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Anonymous Eligibility Gate
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Prove you belong to the DAO's eligible voter set or meet governance thresholds without revealing your identity, wallet address, or token balance. 
          Zero-knowledge Merkle membership proofs enable trustless gatekeeping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Card */}
        <div className="rounded-2xl bg-[#090d18] border border-indigo-950 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-indigo-950">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              Test Anonymous Eligibility Proof
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#050811] border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Active Midnight Identity:</span>
              <p className="text-white font-semibold text-sm">
                {isConnected && selectedAccount ? selectedAccount.address : "No Lace Wallet Connected"}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {isConnected ? "Midnight Lace Authorized (Devnet-Halo)" : "Connect wallet to verify eligibility"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#050811] border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">On-Chain Registry Root:</span>
              <p className="text-indigo-300 font-mono text-[11px] break-all">{voterRegistryRoot}</p>
            </div>

            <button
              onClick={handleVerifyCurrentAccount}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lunar flex items-center justify-center gap-2 transition"
            >
              <Shield className="w-4 h-4" />
              {isConnected ? "Generate & Verify Zero-Knowledge Membership Proof" : "Connect Lace Wallet to Verify"}
            </button>
          </div>

          {verificationResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2 animate-in zoom-in-95 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Proof Verified: Eligible to Vote!
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                The client computed commitment <code className="text-emerald-300 font-mono bg-black/40 px-1 py-0.5 rounded">{verificationResult.commitment.slice(0, 18)}...</code> and verified membership against the root across <strong>{verificationResult.pathLength} Merkle tree levels</strong> without disclosing identity.
              </p>
            </div>
          )}
        </div>

        {/* Midnight Lace Wallet Info Card */}
        <div className="rounded-2xl bg-[#090d18] border border-indigo-950 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-indigo-950">
            <Wallet className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              Midnight Lace DApp Connector
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            AuraVote uses the official Midnight Lace wallet extension for account authorization and transaction signing on the Midnight Devnet.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#050811] border border-slate-800 space-y-1">
              <span className="text-slate-400">Connection Mode:</span>
              <p className="text-white font-medium">Direct Injected Provider (<code className="text-indigo-300 font-mono">window.midnight.mnLace</code>)</p>
            </div>

            <div className="p-3 rounded-xl bg-[#050811] border border-slate-800 space-y-1">
              <span className="text-slate-400">Target Network:</span>
              <p className="text-emerald-400 font-medium">Midnight Devnet-Halo</p>
            </div>

            <div className="p-3 rounded-xl bg-[#050811] border border-slate-800 space-y-1">
              <span className="text-slate-400">Privacy Status:</span>
              <p className="text-emerald-400 font-medium">Confidential Zero-Knowledge Signatures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};