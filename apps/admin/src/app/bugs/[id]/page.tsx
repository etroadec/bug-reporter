import { notFound } from 'next/navigation';
import { createSupabaseAdmin } from '@/lib/supabase';
import { BugDetail } from '@/components/BugDetail';

export default async function BugPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; category?: string; severity?: string; project?: string }>;
}) {
  const { id } = await params;
  const filters = await searchParams;
  const supabase = createSupabaseAdmin();
  const { data: bug } = await supabase.from('bug_reports').select('*').eq('id', id).single();

  if (!bug) notFound();

  // Fetch ordered bug IDs with same filters to determine prev/next
  let query = supabase
    .from('bug_reports')
    .select('id')
    .order('created_at', { ascending: false });

  if (filters.project) query = query.eq('project_id', filters.project);
  if (filters.status) {
    const statuses = filters.status.split(',');
    query = statuses.length > 1 ? query.in('status', statuses) : query.eq('status', statuses[0]);
  }
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.severity) query = query.eq('severity', filters.severity);

  const { data: allBugs } = await query;
  const ids = (allBugs ?? []).map((b) => b.id);
  const currentIndex = ids.indexOf(id);

  const prevId = currentIndex > 0 ? ids[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < ids.length - 1 ? ids[currentIndex + 1] : null;

  // Build filter query string to preserve filters in navigation
  const filterParams = new URLSearchParams();
  if (filters.project) filterParams.set('project', filters.project);
  if (filters.status) filterParams.set('status', filters.status);
  if (filters.category) filterParams.set('category', filters.category);
  if (filters.severity) filterParams.set('severity', filters.severity);
  const filterQs = filterParams.toString();

  return <BugDetail bug={bug} prevId={prevId} nextId={nextId} filterQs={filterQs} />;
}
