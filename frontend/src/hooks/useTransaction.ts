'use client';

import { useCallback, useRef, useState } from 'react';
import { makeWalletClient, submitMilestone, type Evaluation } from '@/lib/contract';
import { pollUntilDecided, type LeaderDraft } from '@/lib/tx';

export type TxPhase = 'idle' | 'wallet' | 'submitted' | 'consensus' | 'confirmed' | 'error';

export interface TxState {
  phase: TxPhase;
  hash: `0x${string}` | null;
  liveStatus: string;
  draft: LeaderDraft | null;
  result: Evaluation | null;
  error: string | null;
}

const INITIAL: TxState = {
  phase: 'idle',
  hash: null,
  liveStatus: '',
  draft: null,
  result: null,
  error: null,
};

function friendlyError(e: unknown): string {
  const m = String(e);
  if (/LackOfFundForMaxFee/i.test(m))
    return 'Your wallet is below the reserve requirements for AI transactions. Request tokens from the faucet.';
  if (/reject|denied|4001/i.test(m)) return 'Signature request rejected by user.';
  if (/rate limit|429|-32/i.test(m)) return 'Network congestion detected. Transaction may still be executing.';
  if (/fetch|network|timeout/i.test(m)) return 'Network connection error. Check RPC status.';
  return 'The transaction failed to execute. Please try again.';
}

export function useTransaction(onConfirmed?: () => void) {
  const [state, setState] = useState<TxState>(INITIAL);
  const busy = useRef(false);

  const reset = useCallback(() => {
    busy.current = false;
    setState(INITIAL);
  }, []);

  const submit = useCallback(
    async (
      address: `0x${string}`,
      scope: string,
      evidence: string,
      onFlight?: (v: boolean) => void,
    ) => {
      if (busy.current) return;
      busy.current = true;
      onFlight?.(true);
      setState({ ...INITIAL, phase: 'wallet' });
      try {
        const client = makeWalletClient(address);
        const hash = await submitMilestone(client, scope, evidence);
        setState((s) => ({ ...s, phase: 'submitted', hash }));

        setState((s) => ({ ...s, phase: 'consensus', liveStatus: 'PENDING' }));
        const { status, draft } = await pollUntilDecided(client, hash, (st, dr) => {
          setState((s) => ({ ...s, liveStatus: st, draft: dr }));
        });

        if (status === 'UNDETERMINED' || status === 'CANCELED' || status === 'TIMEOUT') {
          setState((s) => ({
            ...s,
            phase: 'error',
            error:
              status === 'TIMEOUT'
                ? 'Network validation timed out. Your transaction may still be processing.'
                : 'Validators failed to reach agreement on the milestone outcome.',
          }));
          busy.current = false;
          onFlight?.(false);
          return;
        }

        // Fetch official result from the contract
        let result: Evaluation | null = null;
        const { fetchStats, fetchEvaluations } = await import('@/lib/contract');
        for (let i = 0; i < 5; i++) {
          try {
            const stats = await fetchStats();
            const page = await fetchEvaluations(Math.max(0, Math.floor((stats.evals - 1) / 20) * 20));
            if (page.length) {
              result = page[page.length - 1];
              break;
            }
          } catch {
            /* retry */
          }
          await new Promise((r) => setTimeout(r, 6000));
        }

        setState((s) => ({
          ...s,
          phase: 'confirmed',
          result:
            result ??
            (draft
              ? {
                  id: 'pending',
                  scope,
                  evidence,
                  provider: address,
                  verdict: (draft.verdict as Evaluation['verdict']) ?? 'DEFAULT',
                  score: draft.score ?? 0,
                  reasoning: draft.reasoning ?? '',
                  index: 0,
                }
              : null),
        }));
        busy.current = false;
        onFlight?.(false);
        onConfirmed?.();
      } catch (e) {
        setState((s) => ({ ...s, phase: 'error', error: friendlyError(e) }));
        busy.current = false;
        onFlight?.(false);
      }
    },
    [onConfirmed],
  );

  return { state, submit, reset };
}
