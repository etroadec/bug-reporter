import { cn } from '@/lib/utils';

const severityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-800' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-800' },
};

export function SeverityBadge({ severity }: { severity: string | null }) {
  if (!severity) return <span className="text-xs text-gray-400">&mdash;</span>;
  const config = severityConfig[severity] ?? severityConfig.medium;
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
