'use client';

import React from 'react';
import { AlertCircle, FileSearch2, Loader2 } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 py-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 w-full animate-pulse rounded-sm border border-white/5 bg-[#111726]/20" />
      ))}
    </div>
  );
}

interface EmptyProps {
  onEvaluate: () => void;
}

export function EmptyState({ onEvaluate }: EmptyProps) {
  return (
    <div className="rounded-sm border border-dashed border-white/10 bg-[#111726]/10 px-6 py-16 text-center">
      <FileSearch2 size={40} className="mx-auto text-gray-600" />
      <h3 className="mt-4 font-serif text-xl font-semibold text-white">No evaluations registered</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
        Scope verification records appear empty. Submit your first milestone report to have the AI arbiter audit the work.
      </p>
      <button
        onClick={onEvaluate}
        className="mt-6 inline-flex items-center justify-center rounded-sm bg-[#d4af37] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#090d16] hover:bg-[#e5c158] transition-colors focus-ring cursor-pointer"
      >
        Submit Milestone
      </button>
    </div>
  );
}

interface ErrorProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorProps) {
  return (
    <div className="rounded-sm border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
      <AlertCircle size={36} className="mx-auto text-[#f43f5e]" />
      <h3 className="mt-4 font-serif text-lg font-semibold text-white">Connection Error</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center justify-center rounded-sm border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition-colors focus-ring cursor-pointer"
      >
        Retry RPC Call
      </button>
    </div>
  );
}
