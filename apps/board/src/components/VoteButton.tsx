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
        'flex flex-col items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
        hasVoted
          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 bg-white text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600',
        loading && 'opacity-50'
      )}
    >
      <span className="text-lg">{hasVoted ? '▲' : '△'}</span>
      <span>{voteCount}</span>
    </button>
  );
}
