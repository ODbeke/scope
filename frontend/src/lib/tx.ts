import type { makeWalletClient } from './contract';

const STATUS_NAME: Record<string, string> = {
  '1': 'PENDING',
  '2': 'PROPOSING',
  '3': 'COMMITTING',
  '4': 'REVEALING',
  '5': 'ACCEPTED',
  '6': 'UNDETERMINED',
  '7': 'FINALIZED',
  '8': 'CANCELED',
  '12': 'VALIDATORS_TIMEOUT',
  '13': 'LEADER_TIMEOUT',
};

export const statusName = (s: unknown): string => {
  const direct = STATUS_NAME[String(s)];
  if (direct) return direct;
  return String(s).toUpperCase();
};

const TERMINAL = new Set(['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED']);

export interface LeaderDraft {
  verdict: string;
  score?: number;
  reasoning?: string;
}

function pick(obj: unknown, key: string): unknown {
  if (obj instanceof Map) return obj.get(key);
  if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[key];
  return undefined;
}

export function extractLeaderDraft(tx: unknown): LeaderDraft | null {
  try {
    const consensus = pick(tx, 'consensus_data') ?? pick(tx, 'consensusData');
    const receipts = pick(consensus, 'leader_receipt') ?? pick(consensus, 'leaderReceipt');
    const first = Array.isArray(receipts) ? receipts[0] : receipts;
    const eqOut = pick(first, 'eq_outputs') ?? pick(first, 'eqOutputs');
    const b64 = pick(eqOut, '0');
    if (typeof b64 !== 'string' || b64.length === 0) return null;
    let text: string;
    try {
      text = atob(b64);
    } catch {
      return null;
    }
    // Scan backward to locate JSON brackets
    for (let i = text.length - 1; i >= 0; i--) {
      if (text[i] !== '{') continue;
      try {
        const obj = JSON.parse(text.slice(i));
        if (obj && typeof obj === 'object' && ('verdict' in obj || 'decision' in obj)) {
          return {
            verdict: String(obj.verdict ?? obj.decision ?? '').toUpperCase(),
            score: typeof obj.score === 'number' ? obj.score : undefined,
            reasoning: obj.reasoning ?? obj.rationale ?? obj.note ?? undefined,
          };
        }
      } catch {
        /* continue scan */
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function pollUntilDecided(
  client: ReturnType<typeof makeWalletClient>,
  hash: `0x${string}`,
  onUpdate?: (status: string, draft: LeaderDraft | null) => void,
): Promise<{ status: string; draft: LeaderDraft | null }> {
  let draft: LeaderDraft | null = null;
  for (let i = 0; i < 150; i++) {
    const tx = await client
      .getTransaction({ hash } as Parameters<typeof client.getTransaction>[0])
      .catch(() => null);
    const rawStatus = tx ? (tx as { status?: unknown }).status : 'PENDING';
    const status = statusName(rawStatus);
    draft = (tx && extractLeaderDraft(tx)) ?? draft;
    onUpdate?.(status, draft);
    if (TERMINAL.has(status)) return { status, draft };
    await new Promise((r) => setTimeout(r, 8000));
  }
  return { status: 'TIMEOUT', draft };
}
