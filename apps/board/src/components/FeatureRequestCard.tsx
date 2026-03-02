import type { FeatureRequest } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { VoteButton } from './VoteButton';

const CATEGORY_LABELS: Record<string, string> = {
  'UI/UX': 'UI/UX',
  'Performance': 'Performance',
  'New Feature': 'Nouveaute',
  'Integration': 'Integration',
  'Improvement': 'Amelioration',
  'Other': 'Autre',
};

export function FeatureRequestCard({ feature }: { feature: FeatureRequest }) {
  return (
    <div className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
      <VoteButton featureId={feature.id} voteCount={feature.vote_count} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-gray-900">{feature.title}</h3>
          <StatusBadge status={feature.status} />
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
        <div className="mt-3 flex items-center gap-2.5 text-xs text-gray-400">
          <span className="rounded-full bg-gray-50 px-2.5 py-0.5 font-medium text-gray-500 ring-1 ring-inset ring-gray-200">
            {CATEGORY_LABELS[feature.category] ?? feature.category}
          </span>
          <span>&middot;</span>
          <span>{new Date(feature.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        {feature.admin_response && (
          <div className="mt-3 rounded-xl bg-indigo-50/70 p-3.5 text-sm leading-relaxed text-indigo-800">
            <span className="font-semibold">Reponse : </span>{feature.admin_response}
          </div>
        )}
      </div>
    </div>
  );
}
