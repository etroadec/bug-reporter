'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FeatureRequest } from '@/lib/supabase';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import { FEATURE_STATUSES, FEATURE_STATUS_LABELS } from '@/lib/feature-constants';

export function FeatureDetail({ feature }: { feature: FeatureRequest }) {
  const router = useRouter();
  const [status, setStatus] = useState(feature.status);
  const [adminResponse, setAdminResponse] = useState(feature.admin_response ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/features/${feature.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_response: adminResponse || null }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push('/features')} className="mb-2 text-sm text-indigo-600 hover:text-indigo-800">&larr; Back to list</button>
          <h1 className="text-2xl font-bold text-gray-900">{feature.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submitted {new Date(feature.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FeatureStatusBadge status={status} />
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
            {feature.vote_count} votes
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Description</h2>
            <p className="whitespace-pre-wrap text-gray-700">{feature.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {FEATURE_STATUSES.map((s) => (
                    <option key={s} value={s}>{FEATURE_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Response</label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                  placeholder="Public response visible on the board..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Info</h2>
            <dl className="space-y-3">
              {[
                ['Category', feature.category],
                ['Votes', String(feature.vote_count)],
                ['Project', feature.project_id],
                ['Submitted by', feature.submitted_by],
                ['Updated', new Date(feature.updated_at).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-xs font-medium text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-900">{(value as string) || '\u2014'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
