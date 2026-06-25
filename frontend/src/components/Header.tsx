'use client';

import React from 'react';
import { ShieldCheck, LogOut, Wallet } from 'lucide-react';
import { truncateAddress } from '@/lib/format';
import type { useWallet } from '@/hooks/useWallet';

interface Props {
  wallet: ReturnType<typeof useWallet>;
  onEvaluate: () => void;
}

export function Header({ wallet, onEvaluate }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090d16]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={26} className="text-[#d4af37]" />
            <span className="font-serif text-2xl font-bold tracking-tight text-white">
              S C O P E
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onEvaluate}
              className="hidden sm:inline-flex items-center justify-center rounded-sm bg-[#d4af37] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#090d16] hover:bg-[#e5c158] transition-colors focus-ring cursor-pointer"
            >
              Evaluate Outcome
            </button>

            {wallet.address ? (
              <div className="flex items-center gap-3 rounded-sm border border-white/10 bg-white/5 px-3 py-1.5">
                <div className="text-right">
                  <p className="font-mono text-xs font-medium text-white">
                    {truncateAddress(wallet.address)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {wallet.chainOk ? 'Bradbury Testnet' : 'Wrong Network'}
                  </p>
                </div>
                <button
                  onClick={wallet.disconnect}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Disconnect Wallet"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={wallet.connect}
                disabled={wallet.connecting}
                className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition-colors focus-ring cursor-pointer"
              >
                <Wallet size={14} />
                {wallet.connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
