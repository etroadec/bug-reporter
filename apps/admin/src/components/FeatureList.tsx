'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import type { FeatureRequest } from '@/lib/supabase';
import { FEATURE_STATUSES, FEATURE_STATUS_LABELS } from '@/lib/feature-constants';

export function FeatureList({ features }: { features: FeatureRequest[] }) {
  const router = useRouter();

  if (features.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No feature requests found.</p>
      </div>
    );
  }

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/features/${id}`, {
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
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Votes</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Submitted by</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {features.map((feature) => (
              <tr key={feature.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/features/${feature.id}`} className="block max-w-xs truncate font-medium text-indigo-600 hover:text-indigo-800">
                    {feature.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{feature.category}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{feature.vote_count}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    value={feature.status}
                    onChange={(e) => handleStatusChange(feature.id, e.target.value)}
                    className="cursor-pointer appearance-none rounded-full border-0 bg-transparent py-0.5 pr-6 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                    style={{ backgroundImage: 'none' }}
                  >
                    {FEATURE_STATUSES.map((s) => (
                      <option key={s} value={s}>{FEATURE_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <FeatureStatusBadge status={feature.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {feature.submitted_by ?? '\u2014'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(feature.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
