'use client';

import { useState } from 'react';
import { sendMagicLink } from './actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await sendMagicLink(email);
      if (!res.ok) {
        setError(res.error ?? "Impossible d'envoyer le lien.");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Connexion</h1>

        {sent ? (
          <div className="mt-4">
            <p className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700">
              Lien de connexion envoyé à <strong>{email}</strong>. Ouvrez votre boîte mail et
              cliquez sur le lien pour accéder au portail.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setError('');
              }}
              className="mt-4 w-full text-center text-xs text-gray-500 hover:text-gray-700"
            >
              ← Utiliser une autre adresse
            </button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-gray-500">
              Entrez votre adresse email pour recevoir un lien de connexion.
            </p>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Envoi…' : 'Recevoir un lien de connexion'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
