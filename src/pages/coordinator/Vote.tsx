import { useElectionSearch } from "@/lib/coordinator/navigation";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { AppShell, CandidatePhoto } from "@/components/coordinator/AppShell";
import { VoteSheet } from "@/components/coordinator/VoteSheet";
import { useCandidates, useMyVotes, useUser, useSettings, type Candidate } from "@/hooks/use-coordinator";
import { POSITIONS, contestStatus } from "@/lib/coordinator/rules";
import { ClosedCard } from "@/components/coordinator/Notice";



export default function VotePage() {
  const { user } = useUser();
  const { data: candidates } = useCandidates();
  const { data: myVotes } = useMyVotes(user?.id);
  const search = useElectionSearch();
  const [active, setActive] = useState<string | null>(search.position ?? null);
  const [pick, setPick] = useState<Candidate | null>(null);

  const positions = POSITIONS.filter((p) => candidates?.some((c) => c.position === p.value));
  const done = positions.filter((p) => myVotes?.some((v) => v.position === p.value)).length;

  const { data: settings } = useSettings();
  const status = contestStatus(settings);
  if (settings && status !== "ongoing") {
    return <AppShell><ClosedCard title={status === "upcoming" ? "Voting has not started" : "Voting is closed"} text={status === "upcoming" ? "Check back when voting opens." : "Voting has ended. Check the results page."} /></AppShell>;
  }

  const current = positions.find((p) => p.value === active);

  return (
    <AppShell>
      <h1 className="mt-2 font-display text-3xl font-bold">Your ballot</h1>
      <p className="mt-1 text-muted-foreground">{user ? `${done} of ${positions.length} positions voted` : ""}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
        <div className="h-full bg-gradient-primary transition-all" style={{ width: `${positions.length ? (done / positions.length) * 100 : 0}%` }} />
      </div>

      {!current ? (
        <div className="mt-6 space-y-3">
          {positions.map((p) => {
            const v = myVotes?.find((x) => x.position === p.value);
            const votedFor = candidates?.find((c) => c.id === v?.application_id);
            return (
              <Button variant="election" size="election" key={p.value} onClick={() => !v && setActive(p.value)} disabled={!!v} className="flex w-full items-center gap-4 rounded-2xl border border-primary/50 bg-card p-4 text-left disabled:opacity-80">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${v ? "bg-success text-primary-foreground" : "border border-primary text-primary"}`}>
                  {v ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold uppercase">{p.label}</p>
                  <p className="truncate text-sm text-muted-foreground">{v ? `Voted: ${votedFor?.student_name ?? ""}` : p.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6">
          <Button variant="election" size="election" onClick={() => setActive(null)} className="text-sm text-primary">← All positions</Button>
          <h2 className="mt-2 font-display text-2xl font-bold uppercase">{current.label}</h2>
          <p className="text-sm text-muted-foreground">{current.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {candidates?.filter((c) => c.position === current.value).map((c) => (
              <Button variant="election" size="election" key={c.id} onClick={() => setPick(c)} className="overflow-hidden rounded-3xl border-2 border-primary/60 bg-card text-left transition hover:border-primary hover:shadow-election">
                <CandidatePhoto name={c.student_name} url={c.photo_url} className="h-40 w-full" />
                <div className="p-3">
                  <p className="truncate font-display font-bold uppercase">{c.student_name}</p>
                  <p className="text-xs text-muted-foreground">{c.class_name}{c.stream_name ? ` · ${c.stream_name}` : ""}</p>
                  <p className="mt-2 rounded-full bg-gradient-primary py-1.5 text-center text-sm font-semibold text-primary-foreground">Vote</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      <VoteSheet candidate={pick} userId={user?.id} onClose={() => setPick(null)} onDone={() => setActive(null)} />
    </AppShell>
  );
}
