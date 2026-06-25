'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchEvaluations, fetchStats, type Evaluation, type Stats } from '@/lib/contract';

const POLL_MS = 60000;

export interface ContractData {
  evaluations: Evaluation[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  derived: { total: number; verified: number; deficient: number; defaultCount: number; avgScore: number };
  refresh: () => Promise<void>;
  setTxInFlight: (v: boolean) => void;
}

export function useContractData(): ContractData {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const txInFlight = useRef(false);
  const alive = useRef(true);

  const loadAll = useCallback(async () => {
    try {
      const all: Evaluation[] = [];
      let start = 0;
      for (let guard = 0; guard < 50; guard++) {
        const page = await fetchEvaluations(start);
        all.push(...page);
        if (page.length < 20) break;
        start += 20;
      }
      const s = await fetchStats();
      if (!alive.current) return;
      setEvaluations(all);
      setStats(s);
      setError(null);
    } catch (e) {
      if (!alive.current) return;
      const msg = String(e);
      if (/contract not found|execution reverted/i.test(msg)) {
        setError(
          'No evaluator contract responded at the configured address on Bradbury. Deployment verification may be required.'
        );
      } else {
        setError('Unable to fetch audit records from the blockchain.');
      }
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const setTxInFlight = useCallback((v: boolean) => {
    txInFlight.current = v;
  }, []);

  useEffect(() => {
    alive.current = true;
    loadAll();
    const id = setInterval(() => {
      if (!txInFlight.current) loadAll();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [loadAll]);

  const derived = useMemo(() => {
    const total = evaluations.length;
    const verified = evaluations.filter((p) => p.verdict === 'VERIFIED').length;
    const deficient = evaluations.filter((p) => p.verdict === 'DEFICIENT').length;
    const defaultCount = evaluations.filter((p) => p.verdict === 'DEFAULT').length;
    const avgScore = total ? Math.round(evaluations.reduce((a, p) => a + p.score, 0) / total) : 0;
    return { total, verified, deficient, defaultCount, avgScore };
  }, [evaluations]);

  return {
    evaluations,
    stats,
    loading,
    error,
    derived,
    refresh,
    setTxInFlight,
  };
}
