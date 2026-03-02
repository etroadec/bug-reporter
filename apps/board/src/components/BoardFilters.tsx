'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const STATUSES = ['all', 'under_review', 'planned', 'in_progress', 'completed', 'declined'];
const SORT_OPTIONS = ['votes', 'newest'];

const STATUS_LABELS: Record<string, string> = {
  all: 'All Statuses',
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
};

export function BoardFilters({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') ?? 'all';
  const currentSort = searchParams.get('sort') ?? 'votes';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if ((key === 'status' && value === 'all') || (key === 'sort' && value === 'votes')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Preserve voter_id if present
      const voterId = searchParams.get('voter_id');
      if (voterId) params.set('voter_id', voterId);
      router.push(`/${projectId}?${params.toString()}`);
    },
    [router, searchParams, projectId]
  );

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={currentStatus}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <select
        value={currentSort}
        onChange={(e) => updateFilter('sort', e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="votes">Most Voted</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}
