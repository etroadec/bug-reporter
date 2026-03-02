import { SubmitForm } from '@/components/SubmitForm';
import Link from 'next/link';

export default async function SubmitPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/${projectId}`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Retour aux suggestions
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">Proposer une idee</h1>
        <p className="mt-1 text-sm text-gray-500">Partagez vos idees pour nous aider a ameliorer le produit</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <SubmitForm projectId={projectId} />
      </div>
    </div>
  );
}
