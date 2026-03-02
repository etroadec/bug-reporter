const VOTER_KEY = 'bug_reporter_voter_id';

export function getVoterId(): string {
  if (typeof window === 'undefined') return '';

  // Check URL params first (from SDK)
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('voter_id');
  if (fromUrl) {
    localStorage.setItem(VOTER_KEY, fromUrl);
    return fromUrl;
  }

  // Check localStorage
  const stored = localStorage.getItem(VOTER_KEY);
  if (stored) return stored;

  // Generate new
  const id = crypto.randomUUID();
  localStorage.setItem(VOTER_KEY, id);
  return id;
}
