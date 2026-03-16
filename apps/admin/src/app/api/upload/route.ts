import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from('screenshots')
    .upload(fileName, arrayBuffer, { contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from('screenshots').getPublicUrl(fileName);

  return NextResponse.json({ url: data.publicUrl });
}
