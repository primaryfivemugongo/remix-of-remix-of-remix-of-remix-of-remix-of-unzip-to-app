import { useElectionSearch } from "@/lib/coordinator/navigation";
import { useSettings, useUser, useIsAdmin } from "@/hooks/use-coordinator";
import { ClosedCard } from "@/components/coordinator/Notice";

import { Crown, Eye, Radio } from "lucide-react";
import { AppShell, CandidatePhoto } from "@/components/coordinator/AppShell";
import { useCandidates } from "@/hooks/use-coordinator";
import { POSITIONS, contestStatus, formatWhen } from "@/lib/coordinator/rules";
import { ShareBar } from "@/components/coordinator/ShareBar";



export default function Results() {
  const { data } = useCandidates(5000);
  const { data: settings } = useSettings();
  const { user } = useUser();
  const { data: isAdminView } = useIsAdmin(user?.id);
  const total = data?.reduce((s, c) => s + c.votes, 0) ?? 0;
  const { position } = useElectionSearch();
  const status = contestStatus(settings);
  const positions = POSITIONS.filter((p) => data?.some((c) => c.position === p.value) && (!position || p.value === position));

  if (settings && !settings.results_public && !isAdminView) {
    return <AppShell><ClosedCard title="Results are hidden" text="The Electoral Commission will announce results soon." /></AppShell>;
  }
  return (
    <AppShell>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Live results</h1>
        <span className="flex items-center gap-1.5 rounded-full border border-destructive/60 px-3 py-1 text-xs font-semibold uppercase text-destructive">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> Live
        </span>
      </div>
      <div className="mt-5"><ShareBar title="KPM Coordinator Elections 2026 — live results" /></div>
      <div className="mt-5 rounded-3xl border border-primary/50 bg-card p-3">
        <div className="rounded-2xl border-l-4 border-success bg-background/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{status === "upcoming" ? "Starts" : "Started"}</p>
          <p className="font-semibold uppercase">{formatWhen(settings?.voting_starts_at ?? null)}</p>
        </div>
        <div className="mt-3 rounded-2xl border-l-4 border-primary bg-background/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{status === "finished" ? "Ended" : "Ends"}</p>
          <p className="font-semibold uppercase">{formatWhen(settings?.voting_ends_at ?? null)}</p>
        </div>
        <div className="mt-3 rounded-2xl bg-gradient-primary py-3 text-center font-display text-lg font-bold text-primary-foreground shadow-election">
          {total.toLocaleString()} votes cast
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {positions.map((p) => {
          const list = (data ?? []).filter((c) => c.position === p.value);
          const sum = list.reduce((s, c) => s + c.votes, 0);
          return (
            <section key={p.value} className="overflow-hidden rounded-3xl border border-primary/50 bg-card">
              <div className="flex items-baseline justify-between gap-2 p-4 pb-2">
                <h2 className="min-w-0 truncate font-display text-lg font-bold uppercase">{p.label}</h2>
                <p className="shrink-0 text-xs text-muted-foreground">{sum.toLocaleString()} votes</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/30 text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pl-4 font-medium">Candidate</th>
                    <th className="px-2 py-2 text-center font-medium">Rank</th>
                    <th className="px-2 py-2 text-right font-medium">Votes</th>
                    <th className="py-2 pr-4 text-right font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c, i) => {
                    const pct = sum ? Math.round((c.votes / sum) * 100) : 0;
                    return (
                      <tr key={c.id} className="border-b border-primary/15 last:border-0">
                        <td className="py-3 pl-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative shrink-0">
                              <CandidatePhoto name={c.student_name} url={c.photo_url} className={`h-11 w-11 rounded-xl text-sm ${i === 0 && sum ? "ring-2 ring-primary" : "ring-1 ring-primary/40"}`} />
                              {i === 0 && sum > 0 && <Crown className="absolute -top-2 -right-1.5 h-4 w-4 fill-primary text-primary" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">{c.student_name}</p>
                              <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} /></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 text-center font-semibold">#{i + 1}</td>
                        <td className="px-2 text-right"><span className="font-display font-bold text-primary">{c.votes}</span><span className="block text-[11px] text-muted-foreground">{pct}%</span></td>
                        <td className="pr-4 text-right text-muted-foreground">{Number(c.view_count ?? 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
      {position && <a href="/student/electoral/results" className="mt-5 block text-center text-sm text-primary">See all positions</a>}
      <p className="mt-8 flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wider"><Eye className="h-4 w-4" /> {Number(settings?.page_views ?? 0).toLocaleString()} views</p>
    </AppShell>
  );
}
