export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  vote_count: number;
  admin_response: string | null;
  created_at: string;
}
