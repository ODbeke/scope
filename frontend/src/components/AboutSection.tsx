'use client';

import React from 'react';
import { Target, Landmark } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="rounded-sm border border-white/5 bg-[#111726]/20 p-8 backdrop-blur-sm space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="font-serif text-3xl font-bold text-white">THE PROTOCOL</h2>
        <p className="text-xs text-[#d4af37] font-mono uppercase tracking-widest">
          Consensus-Graded Project Milestone Audits
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* The Ambition */}
        <div className="space-y-4 rounded-sm bg-[#090d16]/40 p-6 border border-white/5">
          <div className="flex items-center gap-3">
            <Target className="text-[#d4af37]" size={20} />
            <h3 className="font-serif text-lg font-bold text-white uppercase">The Ambition</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Traditional freelance platforms and service agreements rely on centralized human dispute managers who are slow, expensive, and often fail to understand technical deliverables. SCOPE introduces automated, objective, and decentralized milestone verification, allowing software teams, clients, and DAOs to establish self-resolving deliverables.
          </p>
        </div>

        {/* Decentralized Trust */}
        <div className="space-y-4 rounded-sm bg-[#090d16]/40 p-6 border border-white/5">
          <div className="flex items-center gap-3">
            <Landmark className="text-indigo-400" size={20} />
            <h3 className="font-serif text-lg font-bold text-white uppercase">Decentralized Trust</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            By running subjective evaluations directly on GenLayer, SCOPE leverages multiple independent validators executing a standardized appraisal prompt. The blockchain verifies that validators agree on the categorical completion outcome before recording the seal, making ratings censor-resistant, reproducible, and transparent.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 pt-6">
        <h4 className="font-serif text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4 text-center">
          Engineered Protocol Mechanics
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 bg-white/[0.01] rounded-sm">
            <p className="font-mono text-xs font-semibold text-[#d4af37]">Equivalence Logic</p>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed font-sans">
              Validators must agree on the categorical verdict. Ratings are checked against a 12% drift threshold to absorb natural AI temperature variance fairly.
            </p>
          </div>
          <div className="p-4 bg-white/[0.01] rounded-sm">
            <p className="font-mono text-xs font-semibold text-[#d4af37]">Clamp Backstops</p>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed font-sans">
              Deterministic post-consensus logic clamps ratings to their verdict boundaries, ensuring scores align with the ledger category.
            </p>
          </div>
          <div className="p-4 bg-white/[0.01] rounded-sm">
            <p className="font-mono text-xs font-semibold text-[#d4af37]">Audit Vault Receipts</p>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed font-sans">
              Milestone outcome evidence and SOW criteria are serialized and locked on the ledger, establishing a verifiable proof-of-work asset.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
