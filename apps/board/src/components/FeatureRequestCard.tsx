import type { FeatureRequest } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { VoteButton } from './VoteButton';

export function FeatureRequestCard({ feature }: { feature: FeatureRequest }) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <VoteButton featureId={feature.id} voteCount={feature.vote_count} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-900">{feature.title}</h3>
          <StatusBadge status={feature.status} />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{feature.description}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{feature.category}</span>
          <span>{new Date(feature.created_at).toLocaleDateString()}</span>
        </div>
        {feature.admin_response && (
          <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
            <span className="font-medium">Admin: </span>{feature.admin_response}
          </div>
        )}
      </div>
    </div>
  );
}
