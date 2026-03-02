'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { getVoterId } from '@/lib/voter';
import { cn } from '@/lib/utils';

export function VoteButton({ featureId, voteCount }: { featureId: string; voteCount: number }) {
  const router = useRouter();
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voterId, setVoterId] = useState('');
  const supabase = useMemo(() => createSupabaseClient(), []);

  useEffect(() => {
    const id = getVoterId();
    setVoterId(id);

    supabase
      .from('feature_votes')
      .select('id')
      .eq('feature_request_id', featureId)
      .eq('voter_id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setHasVoted(true);
      });
  }, [featureId, supabase]);

  async function handleVote() {
    if (!voterId || loading) return;
    setLoading(true);

    if (hasVoted) {
      const { error } = await supabase
        .from('feature_votes')
        .delete()
        .eq('feature_request_id', featureId)
        .eq('voter_id', voterId);
      if (!error) setHasVoted(false);
    } else {
      const { error } = await supabase
        .from('feature_votes')
        .insert({ feature_request_id: featureId, voter_id: voterId });
      if (!error) setHasVoted(true);
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all',
        hasVoted
          ? 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm'
          : 'border-gray-200 bg-white text-gray-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-500',
        loading && 'opacity-50'
      )}
    >
      <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className={cn('mb-0.5 transition-colors', hasVoted ? 'text-indigo-600' : 'text-current')}>
        <path d="M8 0L15 9H1L8 0Z" fill="currentColor" />
      </svg>
      <span>{voteCount}</span>
    </button>
  );
}
