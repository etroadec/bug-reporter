import { createSupabaseAdmin } from '@/lib/supabase';
import { BugList } from '@/components/BugList';
import { BugFilters } from '@/components/BugFilters';
import { AddBugModal } from '@/components/AddBugModal';
import { RefreshButton } from '@/components/RefreshButton';
import { Suspense } from 'react';

const PAGE_SIZE = 20;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; severity?: string; project?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createSupabaseAdmin();
  const page = parseInt(params.page ?? '1', 10);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Fetch distinct project IDs for the filter dropdown
  const { data: projectRows } = await supabase
    .from('bug_reports')
    .select('project_id')
    .order('project_id');
  const projects = [...new Set((projectRows ?? []).map((r) => r.project_id))];

  let query = supabase
    .from('bug_reports')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.project && params.project !== 'all') {
    query = query.eq('project_id', params.project);
  }
  if (params.status && params.status !== 'all') {
    const statuses = params.status.split(',');
    query = statuses.length > 1 ? query.in('status', statuses) : query.eq('status', statuses[0]);
  }
  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category);
  }
  if (params.severity && params.severity !== 'all') {
    query = query.eq('severity', params.severity);
  }

  const { data: bugs, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (params.project) sp.set('project', params.project);
    if (params.status) sp.set('status', params.status);
    if (params.category) sp.set('category', params.category);
    if (params.severity) sp.set('severity', params.severity);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `/?${qs}` : '/';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bug Reports</h2>
            <p className="mt-1 text-sm text-gray-500">{count ?? 0} total reports</p>
          </div>
          <div className="flex items-center gap-2 self-start pt-1">
            <RefreshButton />
            <AddBugModal projects={projects} />
          </div>
        </div>
        <Suspense>
          <BugFilters projects={projects} />
        </Suspense>
      </div>

      <BugList bugs={bugs ?? []} />

      {/* Pagination */}
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
