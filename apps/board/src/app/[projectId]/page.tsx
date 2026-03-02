import { createSupabaseClient } from '@/lib/supabase';
import { FeatureRequestList } from '@/components/FeatureRequestList';
import { BoardFilters } from '@/components/BoardFilters';
import Link from 'next/link';
import { Suspense } from 'react';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Requests</h1>
          <p className="mt-1 text-sm text-gray-500">{(features ?? []).length} requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense>
            <BoardFilters projectId={projectId} />
          </Suspense>
          <Link
            href={`/${projectId}/submit`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Suggest a Feature
          </Link>
        </div>
      </div>

      <FeatureRequestList features={features ?? []} />
    </div>
  );
}
