import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  under_review: { label: 'En examen', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  planned: { label: 'Planifie', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  in_progress: { label: 'En cours', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
  completed: { label: 'Termine', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  declined: { label: 'Decline', className: 'bg-gray-50 text-gray-600 ring-gray-200' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.under_review;
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', config.className)}>
      {config.label}
    </span>
  );
}
