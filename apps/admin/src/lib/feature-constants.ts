export const FEATURE_STATUSES = ['under_review', 'planned', 'in_progress', 'completed', 'declined'] as const;

export const FEATURE_STATUS_LABELS: Record<string, string> = {
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
};
