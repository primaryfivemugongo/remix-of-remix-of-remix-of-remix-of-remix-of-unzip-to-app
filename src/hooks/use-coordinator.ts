import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/coordinator/client";
export type Candidate = {
  id: string; user_id: string | null; student_name: string; class_name: string; stream_name: string | null; age: number | null;
  position: string; experience: string | null; manifesto: string; photo_url: string | null; manifesto_photos: string[];
  youtube_url: string | null; status: string; created_at: string; view_count: number; votes: number;
};
export function useUser() { const { user, isLoading, userName, photoUrl, signOut, userRole } = useAuth(); return { user, ready: !isLoading, name: userName, photoUrl, signOut, userRole }; }
export function useCandidates(refetchInterval: number | false = false) {
  const { user, ready } = useUser();
  return useQuery({ queryKey: ["candidates", user?.id], enabled: ready && !!user, refetchInterval,
    queryFn: async (): Promise<Candidate[]> => {
      const [{ data: apps, error }, { data: counts, error: countError }] = await Promise.all([supabase.from("electoral_applications").select().eq("status", "approved"), supabase.rpc("get_vote_counts")]);
      if (error || countError) throw new Error(error?.message ?? countError?.message);
      const map = new Map<string, number>((counts ?? []).map((c: any) => [c.application_id, Number(c.votes)]));
      return (apps ?? []).map((a: any) => ({ ...a, votes: map.get(a.id) ?? 0 })).sort((a: Candidate, b: Candidate) => b.votes - a.votes);
    } });
}
export function useMyVotes(userId?: string) {
  return useQuery({ queryKey: ["my-votes", userId], enabled: !!userId, queryFn: async (): Promise<{ position: string; application_id: string }[]> => { const r = await supabase.from("electoral_votes").select(); if (r.error) throw new Error(r.error.message); return r.data ?? []; } });
}
export function useIsAdmin(userId?: string) {
  return useQuery({ queryKey: ["is-admin", userId], enabled: !!userId, queryFn: async () => { const r = await supabase.rpc("has_role"); if (r.error) throw new Error(r.error.message); return !!r.data; } });
}
export type ElectionSettings = { voting_open: boolean; applications_open: boolean; results_public: boolean; announcement: string | null; voting_starts_at: string | null; voting_ends_at: string | null; page_views: number };
export function useSettings() {
  const { user } = useUser();
  return useQuery({ queryKey: ["election-settings", user?.id], enabled: !!user, refetchInterval: 5000, queryFn: async (): Promise<ElectionSettings> => { const r = await supabase.from("election_settings").select().eq("id", 1).single(); if (r.error) throw new Error(r.error.message); return r.data; } });
}
export function useTurnout() {
  return useQuery({ queryKey: ["turnout"], refetchInterval: 10000, queryFn: async (): Promise<{ voters: number; ballots: number; accounts: number }> => { const r = await supabase.rpc("get_turnout"); if (r.error) throw new Error(r.error.message); return r.data?.[0] ?? { voters: 0, ballots: 0, accounts: 0 }; } });
}
export function usePageView() {
  const { user } = useUser();
  useEffect(() => { if (!user || sessionStorage.getItem("coordinator-viewed")) return; void supabase.rpc("record_page_view").then(r => { if (!r.error) sessionStorage.setItem("coordinator-viewed", "1"); }); }, [user]);
}
export function useCandidateView(id?: string) {
  const { user } = useUser();
  useEffect(() => { if (!id || !user || sessionStorage.getItem(`coordinator-view-${id}`)) return; void supabase.rpc("record_candidate_view", { _id: id }).then(r => { if (!r.error) sessionStorage.setItem(`coordinator-view-${id}`, "1"); }); }, [id, user]);
}