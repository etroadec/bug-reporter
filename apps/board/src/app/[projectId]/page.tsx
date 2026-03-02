import { createSupabaseClient } from '@/lib/supabase';
import { FeatureRequestList } from '@/components/FeatureRequestList';
import { BoardFilters } from '@/components/BoardFilters';
import Link from 'next/link';

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ status?: string; sort?: string; voter_id?: string }>;
}) {
  const { projectId } = await params;
  const sp = await searchParams;
  const supabase = createSupabaseClient();

  const sort = sp.sort ?? 'votes';
  const orderColumn = sort === 'newest' ? 'created_at' : 'vote_count';

  let query = supabase
    .from('feature_requests')
    .select('*')
    .eq('project_id', projectId)
    .order(orderColumn, { ascending: false });

  if (sp.status && sp.status !== 'all') {
    query = query.eq('status', sp.status);
  }

  const { data: features } = await query;
  const count = (features ?? []).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
          <span className="text-2xl">💡</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Suggestions</h1>
        <p className="mt-1 text-sm text-gray-500">
          {count === 0 ? 'Aucune suggestion pour le moment' : `${count} suggestion${count > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BoardFilters projectId={projectId} />
        <Link
          href={`/${projectId}/submit`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow active:scale-[0.98]"
        >
          <span>+</span>
          Proposer une idee
        </Link>
      </div>

      <FeatureRequestList features={features ?? []} />
    </div>
  );
}
