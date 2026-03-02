'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const STATUSES = ['all', 'open', 'in_progress', 'resolved', 'closed'];
const CATEGORIES = ['all', 'Bug', 'Crash', 'UI', 'Performance', 'Feature Request', 'Other'];
const SEVERITIES = ['all', 'low', 'medium', 'high', 'critical'];

export function BugFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') ?? 'all';
  const currentCategory = searchParams.get('category') ?? 'all';
  const currentSeverity = searchParams.get('severity') ?? 'all';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete('page');
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={currentStatus}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
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
        value={currentSeverity}
        onChange={(e) => updateFilter('severity', e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {SEVERITIES.map((s) => (
          <option key={s} value={s}>{s === 'all' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}
