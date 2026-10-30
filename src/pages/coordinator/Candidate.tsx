import { useElectionParams } from "@/lib/coordinator/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/coordinator/navigation";
import { useState } from "react";
import { ArrowLeft, ChevronRight, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, CandidatePhoto } from "@/components/coordinator/AppShell";
import { VoteSheet } from "@/components/coordinator/VoteSheet";
import { useCandidates, useCandidateView, useMyVotes, useUser } from "@/hooks/use-coordinator";
import { positionLabel } from "@/lib/coordinator/rules";

import { ManifestoMedia } from "@/components/coordinator/ManifestoMedia";



export default function CandidatePage() {
  const { id } = useElectionParams();
  const { data, isLoading } = useCandidates();
  const { user } = useUser();
  const { data: myVotes } = useMyVotes(user?.id);
  const [tab, setTab] = useState<"about" | "manifesto">("about");
  const [open, setOpen] = useState(false);
  const c = data?.find((x) => x.id === id);
  useCandidateView(id);
  const voted = myVotes?.find((v) => v.position === c?.position);

  if (isLoading) return <AppShell><div className="h-96 animate-pulse rounded-3xl bg-card" /></AppShell>;
  if (!c) return <AppShell><p className="py-20 text-center">Candidate not found.</p></AppShell>;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: c.student_name, url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40" aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="font-display text-xl font-semibold uppercase tracking-wider">Details</h1>
        <Button variant="election" size="election" onClick={share} className="flex items-center gap-1.5 rounded-full border border-foreground/40 px-3 py-1.5 text-xs uppercase"><Share2 className="h-3.5 w-3.5" /> Share</Button>
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <CandidatePhoto name={c.student_name} url={c.photo_url} className="h-56 w-48 rounded-3xl ring-4 ring-primary shadow-election" />
        <h2 className="mt-5 font-display text-2xl font-bold uppercase">{c.student_name}</h2>
        <span className="mt-2 rounded-full border border-primary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">{positionLabel(c.position)}</span>
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-primary/30 rounded-2xl border border-primary/40 bg-card py-4 text-center">
        <Stat label="Votes" value={c.votes.toLocaleString()} primary />
        <Stat label="Class" value={`${c.class_name}${c.stream_name ? ` ${c.stream_name[0]}` : ""}`} />
        <Stat label="Age" value={c.age ? String(c.age) : "—"} />
      </div>

      <div className="mt-6 flex justify-center">
        {voted ? (
          <p className="rounded-full border border-primary/50 px-6 py-3 text-sm text-muted-foreground">
            {voted.application_id === c.id ? "✓ You voted for this candidate" : "You already voted for this position"}
          </p>
        ) : (
          <Button variant="election" size="election" onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-full border-2 border-foreground bg-gradient-primary px-10 py-4 font-display text-xl font-semibold text-primary-foreground shadow-election">
            <Heart className="h-6 w-6 fill-current" /> Vote now
          </Button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 border-b border-foreground/15">
        {(["about", "manifesto"] as const).map((t) => (
          <Button variant="election" size="election" key={t} onClick={() => setTab(t)} className={`border-b-2 pb-3 font-display text-base uppercase ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {t === "about" ? "Basic details" : "Manifesto"}
          </Button>
        ))}
      </div>

      <section className="mt-6 border-l-4 border-primary pl-5">
        <p className="font-display text-xl text-primary">{tab === "about" ? "About" : "Manifesto"}</p>
        <h3 className="font-display text-3xl font-bold uppercase leading-none text-foreground/70">{tab === "about" ? "About the candidate" : "My promise to KPM"}</h3>
      </section>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-foreground/85">
        {tab === "about" ? (
          <>
            <p><span className="text-muted-foreground">CLASS:</span> {c.class_name}{c.stream_name ? ` (${c.stream_name} stream)` : ""}</p>
            <p><span className="text-muted-foreground">RUNNING FOR:</span> {positionLabel(c.position)}</p>
            {c.experience && <p><span className="text-muted-foreground">EXPERIENCE:</span> {c.experience}</p>}
          </>
        ) : (
          <><p className="whitespace-pre-line">{c.manifesto}</p><ManifestoMedia photos={c.manifesto_photos} video={c.youtube_url} /></>
        )}
      </div>

      <Link to="/" className="mx-auto mt-10 flex max-w-sm items-center justify-center gap-2 rounded-full border-2 border-primary/70 bg-card py-4 font-display text-lg">
        Show all candidates <ChevronRight className="h-5 w-5 text-primary" />
      </Link>

      <VoteSheet candidate={open ? c : null} userId={user?.id} onClose={() => setOpen(false)} />
    </AppShell>
  );
}

function Stat({ label, value, primary }: { label: string; value: string; primary?: boolean }) {
  return (
    <div>
      <p className={`font-display text-2xl font-bold ${primary ? "text-primary" : ""}`}>{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
