import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { QuestionStatus } from '../types';

interface VerifiedSolutionBadgeProps {
  status?: QuestionStatus;
  verifiedBy?: string;
  size?: 'sm' | 'md';
}

export const VerifiedSolutionBadge: React.FC<VerifiedSolutionBadgeProps> = ({
  status,
  verifiedBy,
  size = 'sm',
}) => {
  if (!status) return null;

  const sizeStyles =
    size === 'md'
      ? 'px-3 py-1 text-xs gap-1.5'
      : 'px-2.5 py-0.5 text-[11px] gap-1';

  if (status === 'Verified') {
    return (
      <span
        title={
          verifiedBy
            ? `Verified Solution — Confirmed by ${verifiedBy}`
            : 'Verified Solution — Confirmed resolution'
        }
        className={`inline-flex items-center font-semibold rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-xs whitespace-nowrap ${sizeStyles}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Verified Solution</span>
      </span>
    );
  }

  if (status === 'Resolved') {
    return (
      <span
        title="Resolved — Accepted solution identified"
        className={`inline-flex items-center font-semibold rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/35 whitespace-nowrap ${sizeStyles}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span>Verified Resolution</span>
      </span>
    );
  }

  if (status === 'Answered') {
    return (
      <span
        title="Answered — Responses available, awaiting verification"
        className={`inline-flex items-center font-medium rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 whitespace-nowrap ${sizeStyles}`}
      >
        <Clock className="w-3 h-3 text-amber-400 shrink-0" />
        <span>Answered</span>
      </span>
    );
  }

  return (
    <span
      title="Open Question — Waiting for a solution"
      className={`inline-flex items-center font-medium rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 whitespace-nowrap ${sizeStyles}`}
    >
      <HelpCircle className="w-3 h-3 text-rose-400 shrink-0" />
      <span>Open Question</span>
    </span>
  );
};
