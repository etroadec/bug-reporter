'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const STATUSES = ['all', 'under_review', 'planned', 'in_progress', 'completed', 'declined'];

const STATUS_LABELS: Record<string, string> = {
  all: 'Tous les statuts',
  under_review: 'En cours d\'examen',
  planned: 'Planifie',
  in_progress: 'En cours',
  completed: 'Termine',
  declined: 'Decline',
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
      const voterId = searchParams.get('voter_id');
      if (voterId) params.set('voter_id', voterId);
      router.push(`/${projectId}?${params.toString()}`);
    },
    [router, searchParams, projectId]
  );

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={currentStatus}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <select
        value={currentSort}
        onChange={(e) => updateFilter('sort', e.target.value)}
        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        <option value="votes">Plus votes</option>
        <option value="newest">Plus recents</option>
      </select>
    </div>
  );
}
