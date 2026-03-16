'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Bug', 'Crash', 'UI', 'Performance', 'Feature Request', 'Other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export function AddBugModal({ projects }: { projects: string[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    description: '',
    category: 'Bug',
    severity: '',
    project_id: projects[0] ?? '',
    reported_by: '',
    assigned_to: '',
    notes: '',
  });

  function reset() {
    setForm({
      description: '',
      category: 'Bug',
      severity: '',
      project_id: projects[0] ?? '',
      reported_by: '',
      assigned_to: '',
      notes: '',
    });
    setPreview(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.description.trim()) {
      setError('La description est requise.');
      return;
    }
    if (!form.project_id.trim()) {
      setError('Le Project ID est requis.');
      return;
    }

    setSaving(true);
    try {
      let screenshot_url: string | undefined;
      const file = fileRef.current?.files?.[0];
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error ?? 'Upload failed');
          return;
        }
        screenshot_url = uploadData.url;
      }

      const body: Record<string, string> = { ...form };
      if (screenshot_url) body.screenshot_url = screenshot_url;

      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create bug');
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        + Add Bug
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        + Add Bug
      </button>

      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setOpen(false); reset(); }}>
        <div
          className="mx-4 w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Add Bug Report</h2>
            <button onClick={() => { setOpen(false); reset(); }} className="text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe the bug..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Screenshot</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
              />
              {preview && (
                <img src={preview} alt="Preview" className="mt-2 h-32 rounded-lg border border-gray-200 object-contain" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Project ID *</label>
              {projects.length > 0 ? (
                <select
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {projects.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  placeholder="e.g. my-app"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reported by</label>
                <input
                  type="text"
                  value={form.reported_by}
                  onChange={(e) => setForm({ ...form, reported_by: e.target.value })}
                  placeholder="Name or email"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned to</label>
                <input
                  type="text"
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  placeholder="Name or email"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Internal notes..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setOpen(false); reset(); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Bug'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
