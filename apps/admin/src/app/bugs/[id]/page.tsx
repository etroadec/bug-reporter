import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { BugDetail } from '@/components/BugDetail';

export default async function BugPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseClient();
  const { data: bug } = await supabase.from('bug_reports').select('*').eq('id', id).single();

  if (!bug) notFound();

  return <BugDetail bug={bug} />;
}
