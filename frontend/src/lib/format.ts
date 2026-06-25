export function truncateAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatScore(score: number): string {
  return `${score}/100`;
}

export const verdictColors = {
  VERIFIED: 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/5',
  DEFICIENT: 'text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/5',
  DEFAULT: 'text-[#f43f5e] border-[#f43f5e]/30 bg-[#f43f5e]/5',
};

export const verdictText = {
  VERIFIED: 'Verified Completion',
  DEFICIENT: 'Scope Deficiencies',
  DEFAULT: 'Default / Incomplete',
};
