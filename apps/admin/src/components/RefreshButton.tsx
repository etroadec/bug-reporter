'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  function handleRefresh() {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 600);
  }

  return (
    <button
      onClick={handleRefresh}
      title="Refresh"
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
    >
      <svg
        className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );
}
