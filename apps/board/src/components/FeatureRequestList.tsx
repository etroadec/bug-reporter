import type { FeatureRequest } from '@/lib/types';
import { FeatureRequestCard } from './FeatureRequestCard';

export function FeatureRequestList({ features }: { features: FeatureRequest[] }) {
  if (features.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <span className="text-2xl">✨</span>
        </div>
        <p className="font-medium text-gray-600">Aucune suggestion pour le moment</p>
        <p className="mt-1 text-sm text-gray-400">Soyez le premier a proposer une idee !</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {features.map((feature) => (
        <FeatureRequestCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
