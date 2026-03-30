'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const STATUSES = ['open', 'in_progress', 'resolved', 'test', 'closed'];
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  test: 'Test',
  closed: 'Closed',
};
const CATEGORIES = ['all', 'Bug', 'Crash', 'UI', 'Performance', 'Feature Request', 'Other'];
const SEVERITIES = ['all', 'low', 'medium', 'high', 'critical'];

const STORAGE_KEY = 'bug-reporter-filters';

function saveFiltersToStorage(filters: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // localStorage unavailable
  }
}

function loadFiltersFromStorage(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function BugFilters({ projects }: { projects: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // On first load, if no URL params exist, restore from localStorage
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const hasUrlParams = searchParams.has('status') || searchParams.has('category') || searchParams.has('severity') || searchParams.has('project');
    if (hasUrlParams) {
      // Save current URL params to storage
      const filters: Record<string, string> = {};
      for (const [key, value] of searchParams.entries()) {
        if (key !== 'page') filters[key] = value;
      }
      saveFiltersToStorage(filters);
      return;
    }

    const saved = loadFiltersFromStorage();
    if (saved && Object.keys(saved).length > 0) {
      const params = new URLSearchParams(saved);
      router.replace(`/?${params.toString()}`);
    }
  }, []);

  const currentProject = searchParams.get('project') ?? 'all';
  const currentStatusParam = searchParams.get('status') ?? '';
  const selectedStatuses = currentStatusParam ? currentStatusParam.split(',') : [];
  const currentCategory = searchParams.get('category') ?? 'all';
  const currentSeverity = searchParams.get('severity') ?? 'all';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete('page');
      const filters: Record<string, string> = {};
      for (const [k, v] of params.entries()) filters[k] = v;
      saveFiltersToStorage(filters);
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleStatus = useCallback(
    (status: string) => {
      let newStatuses: string[];
      if (selectedStatuses.includes(status)) {
        newStatuses = selectedStatuses.filter((s) => s !== status);
      } else {
        newStatuses = [...selectedStatuses, status];
      }
      updateFilter('status', newStatuses.length === 0 ? '' : newStatuses.join(','));
    },
    [selectedStatuses, updateFilter]
  );

  const clearStatuses = useCallback(() => {
    updateFilter('status', '');
    setStatusDropdownOpen(false);
  }, [updateFilter]);

  const statusLabel = selectedStatuses.length === 0
    ? 'All Statuses'
    : selectedStatuses.length === 1
      ? STATUS_LABELS[selectedStatuses[0]] ?? selectedStatuses[0]
      : `${selectedStatuses.length} statuses`;

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

      {/* Multi-select status dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {statusLabel} <span className="ml-1 text-gray-400">&#9662;</span>
        </button>
        {statusDropdownOpen && (
          <div className="absolute left-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {STATUSES.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(s)}
                  onChange={() => toggleStatus(s)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                {STATUS_LABELS[s] ?? s}
              </label>
            ))}
            <div className="border-t border-gray-100 px-3 py-2">
              <button
                type="button"
                onClick={clearStatuses}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

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
