import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format');
  const supabase = createSupabaseClient();

  let query = supabase
    .from('bug_reports')
    .select('*')
    .order('created_at', { ascending: false });

  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const severity = searchParams.get('severity');

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (severity) query = query.eq('severity', severity);

  const { data: bugs, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (format === 'csv') {
    const headers = ['id', 'description', 'category', 'severity', 'status', 'device_brand', 'device_model', 'device_os', 'device_os_version', 'app_name', 'app_version', 'current_screen', 'created_at'];
    const csvRows = [
      headers.join(','),
      ...(bugs ?? []).map((bug) =>
        headers.map((h) => {
          const val = bug[h as keyof typeof bug];
          const str = val === null || val === undefined ? '' : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ];
    return new NextResponse(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="bug-reports.csv"',
      },
    });
  }

  return NextResponse.json(bugs);
}
