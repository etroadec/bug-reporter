'use client';

import { useState } from 'react';

export function ScreenshotViewer({ url }: { url: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!url) return <span className="text-sm text-gray-400">No screenshot</span>;

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="block overflow-hidden rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
        <img src={url} alt="Bug screenshot" className="h-48 w-full object-cover" />
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setIsOpen(false)}>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img src={url} alt="Bug screenshot fullsize" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
