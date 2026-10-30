import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "@/lib/coordinator/navigation";
import { ArrowRight, CheckCircle2, Clock, Copy, Crown, Facebook, MessageCircle, Search, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { useCandidates, useSettings } from "@/hooks/use-coordinator";
import { POSITIONS, contestStatus, type ContestStatus } from "@/lib/coordinator/rules";
import { CandidatePhoto, Crest } from "./AppShell";

const TABS: { value: ContestStatus; label: string; heading: string; sub: string }[] = [
  { value: "ongoing", label: "Ongoing", heading: "Ongoing Contests", sub: "Find your favourite. Make your vote count." },
  { value: "upcoming", label: "Upcoming", heading: "Upcoming Contests", sub: "Discover contests before voting opens." },
  { value: "finished", label: "Finished", heading: "Finished Contests", sub: "Explore completed contests and their results." },
];

export function Contests() {
  const { data: candidates } = useCandidates();
  const { data: settings } = useSettings();
  const status = contestStatus(settings);
  const [tab, setTab] = useState<ContestStatus>(status);
  const [q, setQ] = useState("");
  const [share, setShare] = useState<string | null>(null);
  const t = TABS.find((x) => x.value === tab) ?? TABS[0];
  const needle = q.trim().toLowerCase();

  const contests = POSITIONS.map((p) => {
    const list = (candidates ?? []).filter((c) => c.position === p.value);
    return { ...p, list, votes: list.reduce((s, c) => s + c.votes, 0) };
  }).filter((p) => p.list.length > 0 && (!needle || p.label.toLowerCase().includes(needle) || p.list.some((c) => c.student_name.toLowerCase().includes(needle))));
  const shown = tab === status ? contests : [];
  const ends = settings?.voting_ends_at ? new Date(settings.voting_ends_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Kampala" }) : null;
  const starts = settings?.voting_starts_at ? new Date(settings.voting_starts_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Kampala" }) : null;
  const when = status === "upcoming" ? `Voting opens ${starts}` : status === "finished" ? `Ended ${ends ?? ""}` : ends ? `Voting ends ${ends} EAT` : "Voting open";

  return (
    <section className="mt-2">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Voting contests</p>
      <h1 className="mt-1 font-display text-4xl font-bold leading-tight">{t.heading}</h1>
      <p className="mt-1 text-muted-foreground">{t.sub}</p>
      <p className="mt-5 text-sm font-semibold">Search contests or candidates</p>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-primary/40 bg-card py-2 pl-4 pr-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by contest or candidate" className="w-full bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground" />
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent"><ArrowRight className="h-4 w-4" /></span>
      </div>
      <div className="mt-5 flex gap-6 border-b border-border">
        {TABS.map((x) => (
          <Button variant="election" size="election" key={x.value} onClick={() => setTab(x.value)} className={`-mb-px border-b-4 pb-2 font-semibold ${tab === x.value ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>{x.label}</Button>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        {shown.length === 0 && (
          <div className="rounded-3xl border border-primary/30 bg-card px-6 py-10 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent"><Crown className="h-7 w-7 text-primary" /></span>
            <p className="mt-5 font-display text-2xl font-bold">No {t.label.toLowerCase()} contests found.</p>
            <p className="mt-2 text-sm text-muted-foreground">Contests will appear here when they match this section.</p>
          </div>
        )}
        {shown.map((p) => (
          <article key={p.value} className="relative rounded-3xl border border-primary/40 bg-card p-4">
            <div className="flex gap-4">
              <div className="flex h-28 w-36 shrink-0 items-center gap-1 overflow-x-auto rounded-2xl bg-accent px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {p.list.map((c) => <CandidatePhoto key={c.id} name={c.student_name} url={c.photo_url} className="h-20 w-14 shrink-0 rounded-xl text-lg" />)}
                {p.list.length === 0 && <Crest className="mx-auto h-14 w-14" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`flex items-center gap-1 text-sm font-semibold ${status === "finished" ? "text-muted-foreground" : "text-success"}`}>
                  <CheckCircle2 className="h-4 w-4" /> {status === "ongoing" ? "Voting open" : status === "upcoming" ? "Coming soon" : "Finished"}
                </p>
                <p className="text-sm text-muted-foreground">Coordinator</p>
                <p className="font-display text-2xl font-bold">{p.list.length}</p>
                <p className="text-sm text-muted-foreground">Candidates</p>
              </div>
              <Button variant="election" size="election" onClick={() => setShare(share === p.value ? null : p.value)} aria-label={`Share ${p.label}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background/40">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            {share === p.value && <SharePopup title={p.label} onClose={() => setShare(null)} />}
            <h2 className="mt-4 font-display text-xl font-bold">{p.label}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> {when}</p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
              <div><p className="font-display text-2xl font-bold">{p.votes.toLocaleString()}</p><p className="text-sm text-muted-foreground">Total votes</p></div>
              {status === "ongoing" ? (
                <Link to="/vote" search={{ position: p.value }} className="flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 font-semibold text-primary-foreground">Vote Now <ArrowRight className="h-4 w-4" /></Link>
              ) : (
                <Link to="/results" search={{ position: p.value }} className="flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 font-semibold text-primary-foreground">View Results <ArrowRight className="h-4 w-4" /></Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SharePopup({ title, onClose }: { title: string; onClose: () => void }) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/student/electoral/hub` : "";
  const text = encodeURIComponent(`Vote in the KPM ${title} election`);
  const u = encodeURIComponent(link);
  const items = [
    { label: "X", icon: X, href: `https://twitter.com/intent/tweet?text=${text}&url=${u}` },
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${text}%20${u}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ];
  return (
    <div className="absolute inset-x-2 top-16 z-20 rounded-3xl border-2 border-primary bg-popover p-4 shadow-election">
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Share contest</p><p className="font-display font-bold">{title}</p></div>
        <Button variant="election" size="election" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border"><X className="h-4 w-4" /></Button>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {items.map(({ label, icon: Icon, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-xl border border-border py-3 text-xs font-semibold"><Icon className="h-4 w-4" />{label}</a>
        ))}
        <Button variant="election" size="election" onClick={async () => { await navigator.clipboard.writeText(link).catch(() => {}); toast.success("Link copied"); }} className="flex flex-col items-center gap-1 rounded-xl border border-border py-3 text-xs font-semibold"><Copy className="h-4 w-4" />Copy link</Button>
      </div>
    </div>
  );
}
