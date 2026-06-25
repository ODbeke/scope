import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import type { GenLayerClient } from 'genlayer-js/types';
import deploymentInfo from '../../../deployment.json';

export const CONTRACT_ADDRESS = (deploymentInfo.contract_address || '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const DEPLOY_TX = (deploymentInfo.deploy_tx || '') as string;
export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';
export const CHAIN_ID = 4221;

export interface Evaluation {
  id: string;
  scope: string;
  evidence: string;
  provider: string;
  verdict: 'VERIFIED' | 'DEFICIENT' | 'DEFAULT';
  score: number;
  reasoning: string;
  index: number;
}

export interface Stats {
  evals: number;
  verified: number;
  owner: string;
}

export const readClient: GenLayerClient<typeof testnetBradbury> = createClient({
  chain: testnetBradbury,
});

export function makeWalletClient(account: `0x${string}`) {
  return createClient({ chain: testnetBradbury, account, transport: undefined } as Parameters<
    typeof createClient
  >[0]);
}

export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!/rate limit|429|timeout|network|fetch|-32/i.test(String(e))) throw e;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
    }
  }
  throw last;
}

function normalizeEvaluation(raw: unknown): Evaluation {
  const get = (k: string): unknown => {
    if (raw instanceof Map) return raw.get(k);
    if (raw && typeof raw === 'object') return (raw as Record<string, unknown>)[k];
    return undefined;
  };
  const v = String(get('verdict') ?? 'DEFAULT').toUpperCase();
  return {
    id: String(get('id') ?? ''),
    scope: String(get('scope') ?? ''),
    evidence: String(get('evidence') ?? ''),
    provider: String(get('provider') ?? ''),
    verdict: (['VERIFIED', 'DEFICIENT', 'DEFAULT'].includes(v) ? v : 'DEFAULT') as Evaluation['verdict'],
    score: Number(get('score') ?? 0),
    reasoning: String(get('reasoning') ?? get('rationale') ?? ''),
    index: Number(get('index') ?? 0),
  };
}

function normalizeStats(raw: unknown): Stats {
  const get = (k: string): unknown => {
    if (raw instanceof Map) return raw.get(k);
    if (raw && typeof raw === 'object') return (raw as Record<string, unknown>)[k];
    return undefined;
  };
  return {
    evals: Number(get('evals') ?? 0),
    verified: Number(get('verified') ?? 0),
    owner: String(get('owner') ?? ''),
  };
}

export async function fetchEvaluations(start = 0): Promise<Evaluation[]> {
  if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return [];
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_evaluations',
      args: [start],
    }),
  );
  return Array.isArray(res) ? res.map(normalizeEvaluation) : [];
}

export async function fetchStats(): Promise<Stats> {
  if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return { evals: 0, verified: 0, owner: '0x0000000000000000000000000000000000000000' };
  }
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_stats',
      args: [],
    }),
  );
  return normalizeStats(res);
}

export async function fetchEvaluation(id: string): Promise<Evaluation | null> {
  if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return null;
  try {
    const res = await withRpcRetry(() =>
      readClient.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_evaluation',
        args: [id],
      }),
    );
    return normalizeEvaluation(res);
  } catch {
    return null;
  }
}

export async function submitMilestone(
  client: ReturnType<typeof makeWalletClient>,
  scope: string,
  evidence: string,
): Promise<`0x${string}`> {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'submit_milestone',
    args: [scope, evidence],
    value: 0n,
  }) as Promise<`0x${string}`>;
}
