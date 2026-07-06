/**
 * Access control for the admin portal.
 *
 * Only emails listed in the ADMIN_EMAILS env var (comma-separated) may sign in.
 * This is the real security boundary — enforced in middleware — on top of the
 * OTP email verification. If ADMIN_EMAILS is unset, access is denied (fail closed).
 */
export function allowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = allowedAdminEmails();
  return list.length > 0 && list.includes(email.toLowerCase());
}
