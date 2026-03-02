import { createSupabaseAdmin } from '@/lib/supabase';
import { FeatureList } from '@/components/FeatureList';
import { FeatureFilters } from '@/components/FeatureFilters';
import { Suspense } from 'react';

const PAGE_SIZE = 20;

export default async function FeaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; project?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createSupabaseAdmin();
  const page = parseInt(params.page ?? '1', 10);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Fetch distinct project IDs
  const { data: projectRows } = await supabase
    .from('feature_requests')
    .select('project_id')
    .order('project_id');
  const projects = [...new Set((projectRows ?? []).map((r) => r.project_id))];

  const sort = params.sort ?? 'votes';
  const orderColumn = sort === 'newest' ? 'created_at' : sort === 'oldest' ? 'created_at' : 'vote_count';
  const ascending = sort === 'oldest';

  let query = supabase
    .from('feature_requests')
    .select('*', { count: 'exact' })
    .order(orderColumn, { ascending })
    .range(from, to);

  if (params.project && params.project !== 'all') {
    query = query.eq('project_id', params.project);
  }
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category);
  }

  const { data: features, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (params.project) sp.set('project', params.project);
    if (params.status) sp.set('status', params.status);
    if (params.category) sp.set('category', params.category);
    if (params.sort) sp.set('sort', params.sort);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `/features?${qs}` : '/features';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feature Requests</h2>
          <p className="mt-1 text-sm text-gray-500">{count ?? 0} total requests</p>
        </div>
        <Suspense>
          <FeatureFilters projects={projects} />
        </Suspense>
      </div>

      <FeatureList features={features ?? []} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <a href={buildPageUrl(page - 1)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a href={buildPageUrl(page + 1)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
