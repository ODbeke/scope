'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileSpreadsheet, ListFilter, Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatsDashboard } from '@/components/StatsDashboard';
import { AboutSection } from '@/components/AboutSection';
import { EvaluationCard } from '@/components/EvaluationCard';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/States';
import { SubmitModal } from '@/components/SubmitModal';
import { ToastProvider } from '@/components/Toast';
import { useWallet } from '@/hooks/useWallet';
import { useContractData } from '@/hooks/useContractData';
import { useTransaction } from '@/hooks/useTransaction';

type FilterType = 'ALL' | 'VERIFIED' | 'DEFICIENT' | 'DEFAULT';

function Dashboard() {
  const wallet = useWallet();
  const data = useContractData();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('ALL');

  const txApi = useTransaction(() => {
    void data.refresh();
  });

  const openModal = () => setModalOpen(true);

  const filteredEvaluations = useMemo(() => {
    const list = [...data.evaluations].sort((a, b) => b.index - a.index);
    if (filter === 'ALL') return list;
    return list.filter((e) => e.verdict === filter);
  }, [data.evaluations, filter]);

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: `All Audits (${data.derived.total})` },
    { key: 'VERIFIED', label: `Verified (${data.derived.verified})` },
    { key: 'DEFICIENT', label: `Deficient (${data.derived.deficient})` },
    { key: 'DEFAULT', label: `Defaulted (${data.derived.defaultCount})` },
  ];

  return (
    <>
      <Header wallet={wallet} onEvaluate={openModal} />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Hero Banner */}
          <section className="text-center py-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#d4af37]">
              <ShieldCheck size={12} />
              Consensus-Grade Audit Ledger
            </span>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl max-w-3xl mx-auto leading-[1.15]">
              Milestone Outcomes <span className="gold-gradient-text">Verified On-Chain</span>
            </h1>
            <p className="mt-4 text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
              SCOPE evaluates service outcomes against agreed criteria. Judgments are run independently by GenLayer validators, sealing outcome verdicts objectively.
            </p>
          </section>

          {/* Stats Section */}
          <section>
            <StatsDashboard derived={data.derived} />
          </section>

          {/* About Section */}
          <AboutSection />

          {/* Ledger Section */}
          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-white">
                <ListFilter size={16} className="text-[#d4af37]" />
                <h2 className="font-serif text-lg font-bold uppercase tracking-wider">Evaluation Registry</h2>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer focus-ring ${
                      filter === tab.key
                        ? 'border-[#d4af37] bg-[#d4af37]/10 text-white'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Content */}
            <div className="min-h-[200px]">
              {data.loading ? (
                <LoadingSkeleton />
              ) : data.error ? (
                <ErrorState message={data.error} onRetry={() => data.refresh()} />
              ) : data.evaluations.length === 0 ? (
                <EmptyState onEvaluate={openModal} />
              ) : filteredEvaluations.length === 0 ? (
                <div className="rounded-sm border border-dashed border-white/10 bg-[#111726]/10 px-6 py-12 text-center font-sans text-xs text-gray-500">
                  No evaluations matching the selected status.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvaluations.map((evalItem) => (
                    <EvaluationCard key={evalItem.id} evaluation={evalItem} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Call to action panel */}
          <section className="rounded-sm border border-[#d4af37]/35 bg-[#111726]/30 p-8 shadow-gold flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-serif text-xl font-bold text-white uppercase tracking-wide">
                Audit Your SOW Completion
              </h3>
              <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
                Publish SOW parameters and evidence outcomes to trigger consensus-backed AI auditing. Keep a permanent record of quality deliverables.
              </p>
            </div>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-sm bg-[#d4af37] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#090d16] hover:bg-[#e5c158] transition-all hover:-translate-y-0.5 focus-ring cursor-pointer"
            >
              <Plus size={14} />
              Submit Milestone
            </button>
          </section>

        </div>
      </main>

      <Footer />

      <SubmitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        address={wallet.address}
        chainOk={wallet.chainOk}
        onConnect={wallet.connect}
        txApi={txApi}
        setTxInFlight={data.setTxInFlight}
      />
    </>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
