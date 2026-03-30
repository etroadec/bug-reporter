import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800' },
  test: { label: 'Test', className: 'bg-purple-100 text-purple-800' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-800' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.open;
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
