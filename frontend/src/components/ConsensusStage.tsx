'use client';

import React from 'react';
import { FileCheck, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';
import type { TxState } from '@/hooks/useTransaction';
import { verdictColors, verdictText } from '@/lib/format';

const TIMELINE_STEPS = ['SUBMITTED', 'PROPOSING', 'COMMITTING', 'REVEALING', 'ACCEPTED'];

const STEP_DATA = [
  { key: 'SUBMITTED', title: 'Milestone Dispatched', desc: 'Transaction broadcasted to GenLayer' },
  { key: 'PROPOSING', title: 'Leader Appraising', desc: 'AI arbiter runs milestone evaluation prompt' },
  { key: 'COMMITTING', title: 'Validators Auditing', desc: 'Independent validators execute SOW comparison' },
  { key: 'REVEALING', title: 'Tallying Opinions', desc: 'Comparing scores and verdict outcomes' },
  { key: 'ACCEPTED', title: 'Consensus Finalized', desc: 'Evaluation details sealed on the ledger' },
];

function getCurrentStepIndex(liveStatus: string): number {
  if (liveStatus === 'PENDING' || liveStatus === '') return 0;
  if (liveStatus === 'LEADER_TIMEOUT' || liveStatus === 'VALIDATORS_TIMEOUT') return 1;
  const index = TIMELINE_STEPS.indexOf(liveStatus);
  return index < 0 ? 1 : index;
}

export function ConsensusStage({ tx }: { tx: TxState }) {
  const currentIndex = getCurrentStepIndex(tx.liveStatus);
  const isTimeoutState = tx.liveStatus === 'LEADER_TIMEOUT' || tx.liveStatus === 'VALIDATORS_TIMEOUT';
  const draft = tx.draft;

  const getVerdictIcon = (v: string) => {
    if (v === 'VERIFIED') return FileCheck;
    return ShieldAlert;
  };

  const DraftIcon = draft ? getVerdictIcon(draft.verdict) : AlertTriangle;

  return (
    <div className="flex flex-col items-center">
      {/* Animated Circle */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-[#d4af37]/20 animate-pulse" />
        <div className="absolute inset-3 rounded-full border border-dashed border-[#d4af37]/45 animate-[spin_8s_linear_infinite]" />
        <Loader2 size={32} className="animate-spin text-[#d4af37]" />
      </div>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-[#d4af37]">
        {isTimeoutState ? 'Leader rotated, retrying' : 'Validator Auditing In Progress'}
      </p>
      <h3 className="mt-2 font-serif text-2xl font-bold text-white">Consensus Deliberation</h3>
      <p className="mt-1 text-center text-xs text-gray-500 max-w-sm leading-relaxed">
        GenLayer validators are verifying the work report outcome. This timeline updates dynamically.
      </p>

      {/* Timeline List */}
      <div className="mt-8 w-full max-w-md space-y-1.5 rounded-sm border border-white/5 bg-white/[0.01] p-1.5">
        {STEP_DATA.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          return (
            <div
              key={step.key}
              className={`flex items-start gap-4 p-3 rounded-sm transition-colors ${
                isActive ? 'bg-[#d4af37]/5 border border-[#d4af37]/10' : 'border border-transparent'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                  isDone
                    ? 'border-[#10b981] text-[#10b981]'
                    : isActive
                    ? 'border-[#d4af37] text-[#d4af37]'
                    : 'border-white/10 text-gray-600'
                }`}
              >
                {isActive ? <Loader2 size={10} className="animate-spin" /> : isDone ? '\u2713' : idx + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    isDone || isActive ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500 font-sans">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leader Draft Card */}
      {draft && (
        <div className="mt-6 w-full max-w-md rounded-sm border border-dashed border-[#d4af37]/30 bg-[#111726]/60 p-4 text-left transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="font-serif text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Leader Draft Evaluation
            </span>
            <span className="rounded-full bg-[#d4af37]/10 px-2 py-0.5 font-mono text-[9px] text-[#d4af37]">
              Unconfirmed
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`flex items-center gap-2 font-serif text-sm font-semibold uppercase ${verdictColors[draft.verdict as keyof typeof verdictColors] ?? 'text-white'}`}>
              <DraftIcon size={14} />
              {verdictText[draft.verdict as keyof typeof verdictText] ?? draft.verdict}
            </span>
            {typeof draft.score === 'number' && (
              <span className={`font-mono text-2xl font-bold ${verdictColors[draft.verdict as keyof typeof verdictColors] ?? 'text-white'}`}>
                {draft.score}/100
              </span>
            )}
          </div>
          {draft.reasoning && (
            <p className="mt-2 text-xs italic text-gray-400 leading-relaxed font-sans">
              &ldquo;{draft.reasoning}&rdquo;
            </p>
          )}
          <p className="mt-3 text-[10px] text-gray-600 font-sans">
            * This represents the initial leader assessment. Validators are currently re-executing this audit to reach final consensus.
          </p>
        </div>
      )}

      <p className="mt-6 font-mono text-[10px] text-gray-600">
        RPC TX STATUS: <span className="text-white">{tx.liveStatus || 'PENDING'}</span>
      </p>
    </div>
  );
}
