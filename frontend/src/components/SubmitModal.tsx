'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ShieldAlert, ArrowUpRight, Wallet, Check } from 'lucide-react';
import type { useTransaction } from '@/hooks/useTransaction';
import { ConsensusStage } from './ConsensusStage';
import { EvaluationCard } from './EvaluationCard';
import { FAUCET, EXPLORER } from '@/lib/contract';

const MAX_SOW = 500;
const MAX_EVIDENCE = 1000;

interface Props {
  open: boolean;
  onClose: () => void;
  address: `0x${string}` | null;
  chainOk: boolean;
  onConnect: () => void;
  txApi: ReturnType<typeof useTransaction>;
  setTxInFlight: (v: boolean) => void;
}

export function SubmitModal({
  open,
  onClose,
  address,
  chainOk,
  onConnect,
  txApi,
  setTxInFlight,
}: Props) {
  const { state, submit, reset } = txApi;
  const [sow, setSow] = useState('');
  const [evidence, setEvidence] = useState('');
  const [confirming, setConfirming] = useState(false);
  const sowRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && state.phase === 'idle') {
      setTimeout(() => sowRef.current?.focus(), 80);
    }
  }, [open, state.phase]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.phase !== 'consensus' && state.phase !== 'submitted') {
        handleClose();
      }
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, state.phase]);

  if (!open) return null;

  const sowError =
    sow.trim().length === 0 ? 'Scope criteria is required' : sow.length > MAX_SOW ? 'Scope text is too long' : '';
  const evidenceError =
    evidence.trim().length === 0 ? 'Evidence report is required' : evidence.length > MAX_EVIDENCE ? 'Evidence text is too long' : '';
  const isValid = !sowError && !evidenceError;

  function handleClose() {
    if (state.phase === 'consensus' || state.phase === 'submitted' || state.phase === 'wallet')
      return;
    setConfirming(false);
    setSow('');
    setEvidence('');
    reset();
    onClose();
  }

  function handleInitiate() {
    if (!isValid) return;
    if (!address) {
      onConnect();
      return;
    }
    setConfirming(true);
  }

  async function handleConfirmSubmit() {
    if (!address) return;
    setConfirming(false);
    await submit(address, sow.trim(), evidence.trim(), setTxInFlight);
  }

  const isBusy = state.phase === 'wallet' || state.phase === 'submitted' || state.phase === 'consensus';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-y-auto border border-white/10 bg-[#0b0f19] shadow-glass sm:h-auto sm:max-h-[90vh] rounded-sm transition-transform duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#0b0f19] px-6 py-4">
          <span className="font-serif text-lg font-bold tracking-wider text-white">
            EVALUATION INTAKE
          </span>
          {!isBusy && (
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Container */}
        <div className="p-6">
          {/* INPUT FORM */}
          {state.phase === 'idle' && !confirming && (
            <div className="space-y-6">
              <p className="text-xs text-gray-400 leading-relaxed">
                Submit a structured milestones outcome request. Provide the clear scope of work criteria agreed upon, followed by the verifiable evidence of completion. The AI arbiter consensus will resolve completion status.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                  Scope of Work (Criteria)
                </label>
                <textarea
                  ref={sowRef}
                  value={sow}
                  onChange={(e) => setSow(e.target.value.slice(0, MAX_SOW + 20))}
                  rows={4}
                  placeholder="Specify what milestones, features, or deliverables were required..."
                  className="mt-2 w-full rounded-sm border border-white/10 bg-[#111726]/60 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus-ring resize-none font-sans"
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-gray-500">
                  <span className="text-[#f43f5e]">{sow.length > 0 ? sowError : ''}</span>
                  <span className={sow.length > MAX_SOW ? 'text-[#f43f5e]' : ''}>
                    {sow.length}/{MAX_SOW}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                  Outcome Evidence
                </label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value.slice(0, MAX_EVIDENCE + 40))}
                  rows={6}
                  placeholder="Detail the completions, links, or reports showing these criteria have been successfully resolved..."
                  className="mt-2 w-full rounded-sm border border-white/10 bg-[#111726]/60 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus-ring resize-none font-sans"
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-gray-500">
                  <span className="text-[#f43f5e]">{evidence.length > 0 ? evidenceError : ''}</span>
                  <span className={evidence.length > MAX_EVIDENCE ? 'text-[#f43f5e]' : ''}>
                    {evidence.length}/{MAX_EVIDENCE}
                  </span>
                </div>
              </div>

              {!address ? (
                <button
                  onClick={onConnect}
                  className="flex w-full items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors focus-ring cursor-pointer"
                >
                  <Wallet size={14} /> Connect Wallet to Evaluate
                </button>
              ) : (
                <button
                  disabled={!isValid}
                  onClick={handleInitiate}
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#d4af37] py-3 text-xs font-bold uppercase tracking-wider text-[#090d16] hover:bg-[#e5c158] transition-colors focus-ring disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Submit Milestone Audit
                  </button>
                )}
                {!chainOk && address && (
                  <p className="text-center font-mono text-[10px] text-[#f59e0b]">
                    Attention: Please switch your provider chain network to Bradbury Testnet (4221).
                  </p>
                )}
              </div>
            )}

            {/* CONFIRMATION SCREEN */}
            {state.phase === 'idle' && confirming && (
              <div className="text-center py-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5">
                  <ShieldAlert size={24} className="text-[#d4af37]" />
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold text-white">Confirm On-chain Audit</h3>
                <p className="mt-2 text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  This transaction triggers consensus-backed AI auditing on the Bradbury Testnet. A standard transaction gas fee applies (the majority of this is refunded after consensus completes).
                </p>
                <div className="mt-8 flex gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => setConfirming(false)}
                    className="flex-1 rounded-sm border border-white/10 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    className="flex-1 rounded-sm bg-[#d4af37] py-2.5 text-xs font-bold uppercase tracking-wider text-[#090d16] hover:bg-[#e5c158] transition-colors focus-ring cursor-pointer"
                  >
                    Confirm & Send
                  </button>
                </div>
              </div>
            )}

            {/* WALLET CONFIRMATION AND TRANSACTION IN-FLIGHT */}
            {(state.phase === 'wallet' || state.phase === 'submitted') && (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent" />
                <h3 className="mt-6 font-serif text-lg font-semibold text-white">
                  {state.phase === 'wallet' ? 'Verify Signature Request' : 'Broadcasted to Bradbury'}
                </h3>
                <p className="mt-2 text-xs text-gray-400 max-w-xs leading-relaxed">
                  {state.phase === 'wallet'
                    ? 'Approve the signature prompt in your wallet provider extension.'
                    : 'The transaction hash has been broadcasted. Deliberation queue starting...'}
                </p>
                {state.hash && (
                  <a
                    href={`${EXPLORER}/tx/${state.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] text-[#d4af37] hover:underline"
                  >
                    View Tx on Explorer <ArrowUpRight size={10} />
                  </a>
                )}
              </div>
            )}

            {/* CONSENSUS PROGRESS */}
            {state.phase === 'consensus' && (
              <div className="py-2">
                <ConsensusStage tx={state} />
              </div>
            )}

            {/* TRANSACTION CONFIRMED */}
            {state.phase === 'confirmed' && state.result && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#10b981]/30 bg-[#10b981]/5">
                    <Check size={20} className="text-[#10b981]" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-bold text-white">Evaluation Audit Sealed</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    The milestone outcome was assessed and verified under GenLayer validator consensus.
                  </p>
                </div>
                
                <EvaluationCard evaluation={state.result} />
                
                <button
                  onClick={handleClose}
                  className="w-full rounded-sm border border-white/10 bg-white/5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors focus-ring cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

            {/* ERROR DISPLAY */}
            {state.phase === 'error' && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#f43f5e]/30 bg-[#f43f5e]/5">
                  <ShieldAlert size={24} className="text-[#f43f5e]" />
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold text-white">Execution Failure</h3>
                <p className="mt-2 text-xs text-gray-400 max-w-sm leading-relaxed">{state.error}</p>
                {/faucet|reserve/i.test(state.error ?? '') && (
                  <a
                    href={FAUCET}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 font-mono text-[10px] text-[#d4af37] hover:underline"
                  >
                    Claim GEN Testnet Tokens
                  </a>
                )}
                <div className="mt-8 flex gap-3 w-full max-w-xs">
                  <button
                    onClick={() => reset()}
                    className="flex-1 rounded-sm bg-[#d4af37] py-2.5 text-xs font-bold uppercase tracking-wider text-[#090d16] hover:bg-[#e5c158] transition-colors cursor-pointer"
                  >
                    Retry Audit
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 rounded-sm border border-white/10 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
