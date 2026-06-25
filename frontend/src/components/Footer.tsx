'use client';

import React from 'react';
import { ExternalLink, Terminal } from 'lucide-react';
import { EXPLORER, FAUCET, CONTRACT_ADDRESS } from '@/lib/contract';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#070a11] py-8 text-xs text-gray-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-serif text-sm font-semibold text-gray-400">SCOPE Evaluator</p>
            <p>Decentralized milestone outcome auditing powered by GenLayer.</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <Terminal size={12} />
              Explorer Contract
              <ExternalLink size={10} />
            </a>
            <a
              href={FAUCET}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              GEN Faucet
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} SCOPE. All evaluation records are immutable on-chain transactions.</p>
        </div>
      </div>
    </footer>
  );
}
