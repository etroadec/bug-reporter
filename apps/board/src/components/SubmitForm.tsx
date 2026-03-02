'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { getVoterId } from '@/lib/voter';

const CATEGORIES = [
  { value: 'New Feature', label: 'Nouveaute' },
  { value: 'UI/UX', label: 'UI/UX' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Integration', label: 'Integration' },
  { value: 'Improvement', label: 'Amelioration' },
  { value: 'Other', label: 'Autre' },
];

export function SubmitForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('New Feature');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError('');

    const supabase = createSupabaseClient();
    const voterId = getVoterId();

    const { error: insertError } = await supabase.from('feature_requests').insert({
      title: title.trim(),
      description: description.trim(),
      category,
      project_id: projectId,
      submitted_by: voterId,
    });

    if (insertError) {
      setError('Erreur lors de la soumission. Veuillez reessayer.');
      setSubmitting(false);
      return;
    }

    router.push(`/${projectId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Titre
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resume de votre idee..."
          required
          maxLength={200}
          className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Decrivez votre suggestion en detail..."
          required
          maxLength={5000}
          rows={5}
          className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Categorie</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                category === cat.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || !title.trim() || !description.trim()}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer la suggestion'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${projectId}`)}
          className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
