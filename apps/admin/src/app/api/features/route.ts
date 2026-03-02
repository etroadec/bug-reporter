import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format');
  const supabase = createSupabaseAdmin();

  let query = supabase
    .from('feature_requests')
    .select('*')
    .order('vote_count', { ascending: false });

  const status = searchParams.get('status');
  const category = searchParams.get('category');

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);

  const { data: features, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (format === 'csv') {
    const headers = ['id', 'title', 'description', 'category', 'status', 'vote_count', 'submitted_by', 'admin_response', 'created_at'];
    const csvRows = [
      headers.join(','),
      ...(features ?? []).map((f) =>
        headers.map((h) => {
          const val = f[h as keyof typeof f];
          const str = val === null || val === undefined ? '' : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ];
    return new NextResponse(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="feature-requests.csv"',
      },
    });
  }

  return NextResponse.json(features);
}
