export interface ElectoralVote {
  id: string;
  voter_id: string;
  voter_name: string;
  position: string;
  candidate_id: string;
  candidate_name: string;
  voted_at: string;
  created_at: string;
  vote_status?: 'valid' | 'invalid';
  device_type?: string;
  browser?: string;
  os?: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  latitude?: number;
  longitude?: number;
  location_accuracy?: number;
  canvas_fingerprint?: string;
  webgl_fingerprint?: string;
  installed_fonts?: string;
  battery_level?: number;
  battery_charging?: boolean;
  mouse_movement_count?: number;
  average_mouse_speed?: number;
  typing_speed?: number;
  click_count?: number;
  behavior_signature?: string;
}

export const mockElectoralVotes: ElectoralVote[] = [];
