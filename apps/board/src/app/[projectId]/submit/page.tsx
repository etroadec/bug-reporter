import { SubmitForm } from '@/components/SubmitForm';
import Link from 'next/link';

export default async function SubmitPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/${projectId}`} className="text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to board
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Suggest a Feature</h1>
        <p className="mt-1 text-sm text-gray-500">Share your ideas to help us improve</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <SubmitForm projectId={projectId} />
      </div>
    </div>
  );
}
