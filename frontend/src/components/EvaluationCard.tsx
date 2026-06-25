'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileSpreadsheet, User, ShieldAlert } from 'lucide-react';
import { truncateAddress, verdictColors, verdictText } from '@/lib/format';
import type { Evaluation } from '@/lib/contract';

interface Props {
  evaluation: Evaluation;
}

export function EvaluationCard({ evaluation }: Props) {
  const [expanded, setExpanded] = useState(false);

  const getVerdictIcon = (v: Evaluation['verdict']) => {
    if (v === 'VERIFIED') return FileSpreadsheet;
    return ShieldAlert;
  };

  const Icon = getVerdictIcon(evaluation.verdict);

  return (
    <div className="rounded-sm border border-white/10 bg-[#111726]/40 transition-colors hover:bg-[#111726]/60">
      {/* Header Area */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center justify-between p-6 select-none"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border ${verdictColors[evaluation.verdict]}`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-[#d4af37]">
                {evaluation.id}
              </span>
              <span className="text-gray-600">&bull;</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-500">
                <User size={10} />
                {truncateAddress(evaluation.provider)}
              </span>
            </div>
            <h4 className="mt-1 font-serif text-base font-semibold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {evaluation.scope}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${verdictColors[evaluation.verdict]}`}>
              {verdictText[evaluation.verdict]}
            </span>
            <p className="mt-1 font-mono text-sm font-bold text-white">
              {evaluation.score}/100
            </p>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div className="border-t border-white/5 bg-[#090d16]/30 p-6 space-y-6 text-sm">
          {/* Scope of Work */}
          <div>
            <h5 className="font-serif font-semibold uppercase tracking-wider text-xs text-[#d4af37]">
              Scope of Work (Criteria)
            </h5>
            <p className="mt-2 text-gray-300 leading-relaxed font-sans">{evaluation.scope}</p>
          </div>

          {/* Outcome Evidence */}
          <div>
            <h5 className="font-serif font-semibold uppercase tracking-wider text-xs text-[#d4af37]">
              Work Outcome (Evidence)
            </h5>
            <p className="mt-2 text-gray-300 leading-relaxed font-sans">{evaluation.evidence}</p>
          </div>

          {/* AI Reasoning */}
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4">
            <h5 className="font-serif font-semibold uppercase tracking-wider text-xs text-gray-400">
              Arbiter Decision Reasoning
            </h5>
            <p className="mt-2 italic text-gray-400 leading-relaxed font-sans">
              &ldquo;{evaluation.reasoning}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
