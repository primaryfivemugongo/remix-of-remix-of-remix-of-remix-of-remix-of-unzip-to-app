import { Link } from "@/lib/coordinator/navigation";
import { useState } from "react";
import { MapPin, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell, CandidatePhoto } from "@/components/coordinator/AppShell";
import { useCandidates } from "@/hooks/use-coordinator";
import { Announcement } from "@/components/coordinator/Notice";
import { POSITIONS, positionLabel } from "@/lib/coordinator/rules";
import { ShareBar } from "@/components/coordinator/ShareBar";
import { Contests } from "@/components/coordinator/Contests";



export default function Index() {
  const { data, isLoading } = useCandidates();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const usedPositions = POSITIONS.filter((p) => data?.some((c) => c.position === p.value));
  const list = (data ?? []).filter(
    (c) => (filter === "all" || c.position === filter) && c.student_name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <Announcement />
      <Contests />
      <h2 className="mt-10 font-display text-3xl font-bold leading-tight">Vote for your favourite coordinator</h2>
      <div className="mt-5 flex items-center gap-2 rounded-full border border-primary/40 bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search candidates" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2">
        {[{ value: "all", label: "All" }, ...usedPositions].map((p) => (
          <Button variant="ghost"
            key={p.value}
            onClick={() => setFilter(p.value)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${filter === p.value ? "border-primary bg-gradient-primary text-primary-foreground" : "border-primary/40 text-muted-foreground"}`}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 space-y-5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-3xl border border-primary/30 bg-card" />)}
        {!isLoading && data?.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-primary/50 px-4 py-9 text-center">
            <p className="text-muted-foreground">No candidates yet.</p>
            <Button asChild className="mt-5 h-auto max-w-full rounded-full bg-gradient-primary px-5 py-3 text-primary-foreground">
              <Link to="/apply"><UserPlus />Register as a candidate</Link>
            </Button>
          </div>
        )}
        {!isLoading && (data?.length ?? 0) > 0 && list.length === 0 && <p className="py-10 text-center text-muted-foreground">No candidates found.</p>}
        {list.map((c) => (
          <Link
            key={c.id}
            to="/candidate/$id"
            params={{ id: c.id }}
            className="flex gap-4 rounded-3xl border-2 border-primary/60 bg-card p-3 transition hover:border-primary hover:shadow-election"
          >
            <CandidatePhoto name={c.student_name} url={c.photo_url} className="h-40 w-32 shrink-0 rounded-2xl" />
            <div className="flex min-w-0 flex-1 flex-col items-end py-1 text-right">
              <h2 className="w-full truncate font-display text-lg font-bold uppercase">{c.student_name}</h2>
              <p className="mt-2 flex items-center gap-1 text-sm uppercase text-muted-foreground">
                <MapPin className="h-4 w-4" /> {c.class_name}{c.stream_name ? ` · ${c.stream_name}` : ""}
              </p>
              <p className="mt-1 text-sm uppercase text-muted-foreground">{positionLabel(c.position)}</p>
              <p className="mt-auto font-display text-2xl font-bold text-primary">{c.votes.toLocaleString()} votes</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8"><ShareBar title="Vote for your KPM coordinators" /></div>
    </AppShell>
  );
}
