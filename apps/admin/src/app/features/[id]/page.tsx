import { notFound } from 'next/navigation';
import { createSupabaseAdmin } from '@/lib/supabase';
import { FeatureDetail } from '@/components/FeatureDetail';

export default async function FeaturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  const { data: feature } = await supabase.from('feature_requests').select('*').eq('id', id).single();

  if (!feature) notFound();

  return <FeatureDetail feature={feature} />;
}
