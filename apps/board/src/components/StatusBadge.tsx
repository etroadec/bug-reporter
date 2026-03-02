import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  under_review: { label: 'Under Review', className: 'bg-yellow-100 text-yellow-800' },
  planned: { label: 'Planned', className: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', className: 'bg-violet-100 text-violet-800' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', className: 'bg-gray-100 text-gray-800' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.under_review;
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
