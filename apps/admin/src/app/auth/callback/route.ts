import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * Magic-link callback. Supabase redirects here with a `code`; we exchange it for
 * a session (cookies set via @supabase/ssr) and send the user to the dashboard.
 *
 * The redirect base comes from a trusted, server-configured URL — never from
 * request headers — and `next` is constrained to a same-site relative path.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';

  const nextParam = searchParams.get('next') ?? '/';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth`);
}
