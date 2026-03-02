'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const STATUSES = ['all', 'under_review', 'planned', 'in_progress', 'completed', 'declined'];
const CATEGORIES = ['all', 'UI/UX', 'Performance', 'New Feature', 'Integration', 'Improvement', 'Other'];
const SORT_OPTIONS = [
  { value: 'votes', label: 'Most Voted' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

const STATUS_LABELS: Record<string, string> = {
  all: 'All Statuses',
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
};

export function FeatureFilters({ projects }: { projects: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentProject = searchParams.get('project') ?? 'all';
  const currentStatus = searchParams.get('status') ?? 'all';
  const currentCategory = searchParams.get('category') ?? 'all';
  const currentSort = searchParams.get('sort') ?? 'votes';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || (key === 'sort' && value === 'votes')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete('page');
      router.push(`/features?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3">
      {projects.length > 1 && (
        <select
          value={currentProject}
          onChange={(e) => updateFilter('project', e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      )}
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
        value={currentCategory}
        onChange={(e) => updateFilter('category', e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
        ))}
      </select>
      <select
        value={currentSort}
        onChange={(e) => updateFilter('sort', e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
