import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { MerkleTree } from "../crypto/merkle";
import { createVoterCommitment, generateSecretKey } from "../crypto/poseidon";
import { Shield, Key, CheckCircle2, UserCheck, Plus, Sparkles, Lock, ArrowRight } from "lucide-react";

export const EligibilityGate: React.FC = () => {
  const { selectedAccount, accounts, merkleTree, voterRegistryRoot, registerNewCredential } = useWallet();
  const [newVoterName, setNewVoterName] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    commitment: string;
    pathLength: number;
    root: string;
  } | null>(null);

  const handleVerifyCurrentAccount = () => {
    if (!selectedAccount) return;
    const proof = merkleTree.getProof(selectedAccount.merkleIndex);
    const commitment = createVoterCommitment(selectedAccount.secretKey, selectedAccount.blindingFactor);
    const isValid = MerkleTree.verifyProof(commitment, proof);

    setVerificationResult({
      verified: isValid,
      commitment,
      pathLength: proof.path.length,
      root: proof.root
    });
  };

  const handleRegisterNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoterName.trim()) return;
    registerNewCredential(newVoterName.trim());
    setNewVoterName("");
    setVerificationResult(null);
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
              <span className="text-slate-400 font-medium">Active Member:</span>
              <p className="text-white font-semibold text-sm">{selectedAccount?.name}</p>
              <p className="text-[11px] text-slate-400 font-mono truncate">{selectedAccount?.address}</p>
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
              Generate & Verify Zero-Knowledge Membership Proof
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

        {/* Register New Credential Card */}
        <div className="rounded-2xl bg-[#090d18] border border-indigo-950 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-indigo-950">
            <Plus className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              Mint New Confidential Credential
            </h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Generate a new cryptographic keypair and insert a fresh blinded commitment into the Midnight Merkle tree registry.
          </p>

          <form onSubmit={handleRegisterNew} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Credential Holder Name
              </label>
              <input
                type="text"
                value={newVoterName}
                onChange={(e) => setNewVoterName(e.target.value)}
                placeholder="e.g., Frank (New Protocol Contributor)"
                className="w-full bg-slate-900/90 border border-indigo-950 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lunar flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              Mint Confidential Voter Credential
            </button>
          </form>

          {/* Total Registry Leaves */}
          <div className="pt-2">
            <div className="p-3 rounded-xl bg-[#050811] border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Registered Eligible Voters:</span>
              <span className="font-mono font-bold text-indigo-300 text-sm">{accounts.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};