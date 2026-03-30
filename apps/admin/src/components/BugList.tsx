'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import type { BugReport } from '@/lib/supabase';

const STATUSES = ['open', 'in_progress', 'resolved', 'test', 'closed'];

export function BugList({ bugs }: { bugs: BugReport[] }) {
  const router = useRouter();

  if (bugs.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No bug reports found.</p>
      </div>
    );
  }

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/bugs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Device</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bugs.map((bug) => (
              <tr key={bug.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/bugs/${bug.id}`} className="block max-w-xs truncate font-medium text-indigo-600 hover:text-indigo-800">
                    {bug.description}
                  </Link>
                  {bug.current_screen && (
                    <span className="mt-1 block text-xs text-gray-400">{bug.current_screen}</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{bug.category}</td>
                <td className="whitespace-nowrap px-6 py-4"><SeverityBadge severity={bug.severity} /></td>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    value={bug.status}
                    onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                    className="cursor-pointer appearance-none rounded-full border-0 bg-transparent py-0.5 pr-6 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                    style={{ backgroundImage: 'none' }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s === 'in_progress' ? 'In Progress' : s === 'test' ? 'Test' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <StatusBadge status={bug.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {bug.device_brand && bug.device_model
                    ? `${bug.device_brand} ${bug.device_model}`
                    : '\u2014'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(bug.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
