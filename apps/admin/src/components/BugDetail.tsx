'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { BugReport } from '@/lib/supabase';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { ScreenshotViewer } from './ScreenshotViewer';
import { BugComments } from './BugComments';

const STATUSES = ['open', 'in_progress', 'resolved', 'test', 'closed'];
const CATEGORIES = ['Bug', 'Crash', 'UI', 'Performance', 'Feature Request', 'Other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

interface BugDetailProps {
  bug: BugReport;
  prevId?: string | null;
  nextId?: string | null;
  filterQs?: string;
}

export function BugDetail({ bug, prevId, nextId, filterQs }: BugDetailProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState(bug.status);
  const [notes] = useState(bug.notes ?? '');
  const [assignedTo, setAssignedTo] = useState(bug.assigned_to ?? '');
  const [description, setDescription] = useState(bug.description);
  const [category, setCategory] = useState(bug.category);
  const [severity, setSeverity] = useState(bug.severity ?? '');
  const [screenshotUrl, setScreenshotUrl] = useState(bug.screenshot_url);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotPreview(URL.createObjectURL(file));
    } else {
      setScreenshotPreview(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      let newScreenshotUrl = screenshotUrl;

      // Upload new screenshot if one was selected
      const file = fileRef.current?.files?.[0];
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          newScreenshotUrl = uploadData.url;
        }
      }

      await fetch(`/api/bugs/${bug.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assigned_to: assignedTo || null,
          description,
          category,
          severity: severity || null,
          screenshot_url: newScreenshotUrl,
        }),
      });
      router.refresh();
    } finally {
      setSaving(false);
      setScreenshotPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this bug report?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/bugs/${bug.id}`, { method: 'DELETE' });
      router.push('/');
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push('/')} className="mb-2 text-sm text-indigo-600 hover:text-indigo-800">&larr; Back to list</button>
          <h1 className="text-2xl font-bold text-gray-900">{bug.description}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Reported {new Date(bug.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <SeverityBadge severity={severity} />
          </div>
          <div className="flex items-center gap-2">
            {prevId && (
              <button
                onClick={() => router.push(`/bugs/${prevId}${filterQs ? `?${filterQs}` : ''}`)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                &larr; Previous
              </button>
            )}
            {nextId && (
              <button
                onClick={() => router.push(`/bugs/${nextId}${filterQs ? `?${filterQs}` : ''}`)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next &rarr;
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Screenshot */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Screenshot</h2>
            {screenshotPreview ? (
              <img src={screenshotPreview} alt="New screenshot" className="max-h-96 rounded-lg border border-gray-200 object-contain" />
            ) : (
              <ScreenshotViewer url={screenshotUrl} />
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Change screenshot</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Description</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Custom data */}
          {bug.custom_data && Object.keys(bug.custom_data).length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Custom Data</h2>
              <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                {JSON.stringify(bug.custom_data, null, 2)}
              </pre>
            </div>
          )}

          {/* Comments */}
          <BugComments bugId={bug.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status change */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === 'in_progress' ? 'In Progress' : s === 'test' ? 'Test' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned to</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter name or email"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Legacy Notes</label>
                  <p className="mt-1 whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">{notes}</p>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Bug'}
              </button>
            </div>
          </div>

          {/* Device info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Device</h2>
            <dl className="space-y-3">
              {[
                ['Brand', bug.device_brand],
                ['Model', bug.device_model],
                ['OS', bug.device_os ? `${bug.device_os} ${bug.device_os_version ?? ''}` : null],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-xs font-medium text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-900">{(value as string) || '\u2014'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* App info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">App</h2>
            <dl className="space-y-3">
              {[
                ['Name', bug.app_name],
                ['Version', bug.app_version],
                ['Build', bug.app_build],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-xs font-medium text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-900">{(value as string) || '\u2014'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Network info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Network</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-gray-500">Type</dt>
                <dd className="text-sm text-gray-900">{bug.network_type ?? '\u2014'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Connected</dt>
                <dd className="text-sm text-gray-900">{bug.network_connected === null ? '\u2014' : bug.network_connected ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>

          {/* Context */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Context</h2>
            <dl className="space-y-3">
              {[
                ['Screen', bug.current_screen],
                ['Timezone', bug.timezone],
                ['Project', bug.project_id],
                ['Reporter', bug.reported_by],
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
