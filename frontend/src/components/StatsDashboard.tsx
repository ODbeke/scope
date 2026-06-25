'use client';

import React from 'react';
import { Award, FileText, Percent, CheckCircle } from 'lucide-react';

interface Props {
  derived: {
    total: number;
    verified: number;
    deficient: number;
    defaultCount: number;
    avgScore: number;
  };
}

export function StatsDashboard({ derived }: Props) {
  const verifiedPercentage = derived.total
    ? Math.round((derived.verified / derived.total) * 100)
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Stat Card 1 */}
      <div className="rounded-sm border border-white/10 bg-[#111726]/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Evaluated</span>
          <FileText size={18} className="text-[#d4af37]" />
        </div>
        <p className="mt-4 font-mono text-3xl font-bold text-white">{derived.total}</p>
        <p className="mt-1 text-[11px] text-gray-500">Contract milestone submissions</p>
      </div>

      {/* Stat Card 2 */}
      <div className="rounded-sm border border-white/10 bg-[#111726]/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Verified Completions</span>
          <CheckCircle size={18} className="text-[#10b981]" />
        </div>
        <p className="mt-4 font-mono text-3xl font-bold text-[#10b981]">{derived.verified}</p>
        <p className="mt-1 text-[11px] text-gray-500">Successfully verified criteria</p>
      </div>

      {/* Stat Card 3 */}
      <div className="rounded-sm border border-white/10 bg-[#111726]/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Verification Rate</span>
          <Percent size={18} className="text-indigo-400" />
        </div>
        <p className="mt-4 font-mono text-3xl font-bold text-white">{verifiedPercentage}%</p>
        <p className="mt-1 text-[11px] text-gray-500">Percent of scope milestones verified</p>
      </div>

      {/* Stat Card 4 */}
      <div className="rounded-sm border border-white/10 bg-[#111726]/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Average Score</span>
          <Award size={18} className="text-[#d4af37]" />
        </div>
        <p className="mt-4 font-mono text-3xl font-bold text-white">{derived.avgScore}/100</p>
        <p className="mt-1 text-[11px] text-gray-500">Milestone performance rating</p>
      </div>
    </div>
  );
}
