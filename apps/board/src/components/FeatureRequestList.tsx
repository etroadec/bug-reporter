import type { FeatureRequest } from '@/lib/types';
import { FeatureRequestCard } from './FeatureRequestCard';

export function FeatureRequestList({ features }: { features: FeatureRequest[] }) {
  if (features.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No feature requests yet. Be the first to suggest one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <FeatureRequestCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
