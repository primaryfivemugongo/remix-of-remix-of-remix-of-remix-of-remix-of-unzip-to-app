import { Link } from "@/lib/coordinator/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard, FileText, Users, Settings2, Search, Check, X, RotateCcw, Trash2, Eye,
  ShieldCheck, ShieldOff, UserPlus, Trophy, Vote, Clock, Download,
} from "lucide-react";
import { AppShell, CandidatePhoto } from "@/components/coordinator/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/coordinator/client";
import { useCandidates, useIsAdmin, useSettings, useTurnout, useUser } from "@/hooks/use-coordinator";
import { AGES, PUPILS, CLASSES, POSITIONS, STREAMS, positionLabel } from "@/lib/coordinator/rules";
import { ManifestoMedia } from "@/components/coordinator/ManifestoMedia";


import { Button } from "@/components/ui/button";
import { Gate } from "./Apply";



/** Formats an ISO timestamp for a datetime-local input, in local time. */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

type App = {
  id: string; user_id: string | null; student_name: string; class_name: string; stream_name: string | null;
  age: number | null; position: string; experience: string | null; manifesto: string; photo_url: string | null;
  status: string; created_at: string; manifesto_photos: string[]; youtube_url: string | null;
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Candidates", icon: FileText },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings2 },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const { user, ready } = useUser();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const [tab, setTab] = useState<Tab>("overview");

  if (ready && !user) return <AppShell><Gate text="Sign in as the Electoral Commission." /></AppShell>;
  if (!ready || roleLoading) return <AppShell><div className="mt-6 h-60 animate-pulse rounded-3xl bg-card" /></AppShell>;
  if (!isAdmin) return <AppShell><p className="mt-16 text-center text-muted-foreground">Only the Electoral Commission can open this page.</p></AppShell>;

  return (
    <AppShell>
      <div className="mt-2 flex items-center gap-2">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <h1 className="font-display text-2xl font-bold">Electoral Commission</h1>
      </div>
      <div className="sticky top-[72px] z-20 -mx-5 mt-4 bg-background/90 px-5 py-2 backdrop-blur">
        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-primary/40 bg-card p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button variant="election" size="election" key={id} onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold ${tab === id ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <Icon className="h-4 w-4" />{label}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        {tab === "overview" && <Overview onGo={setTab} />}
        {tab === "applications" && <Applications />}
        {tab === "users" && <UsersPanel meId={user?.id ?? ""} />}
        {tab === "settings" && <SettingsPanel />}
      </div>
    </AppShell>
  );
}

function useAllApps() {
  return useQuery({
    queryKey: ["admin-apps"],
    queryFn: async (): Promise<App[]> =>
      (await supabase.from("electoral_applications").select("*").order("created_at", { ascending: false })).data ?? [],
  });
}

function Stat({ label, value, icon: Icon, hint }: { label: string; value: ReactNode; icon: typeof Vote; hint?: string }) {
  return (
    <div className="rounded-2xl border border-primary/40 bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-primary">{hint}</p>}
    </div>
  );
}

function Overview({ onGo }: { onGo: (t: Tab) => void }) {
  const { data: apps } = useAllApps();
  const { data: candidates } = useCandidates(10000);
  const { data: t } = useTurnout();
  const { data: settings } = useSettings();
  const pending = apps?.filter((a) => a.status === "pending").length ?? 0;
  const turnoutPct = t && t.accounts ? Math.round((t.voters / t.accounts) * 100) : 0;
  const positions = POSITIONS.filter((p) => candidates?.some((c) => c.position === p.value));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <StatusPill on={!!settings?.voting_open} label="Voting" />
        <StatusPill on={!!settings?.applications_open} label="Applications" />
        <StatusPill on={!!settings?.results_public} label="Public results" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Pupils who voted" value={t?.voters ?? 0} icon={Vote} hint={`${turnoutPct}% turnout`} />
        <Stat label="Ballots cast" value={t?.ballots ?? 0} icon={Trophy} />
        <Stat label="Registered accounts" value={t?.accounts ?? 0} icon={Users} />
        <Stat label="Approved candidates" value={candidates?.length ?? 0} icon={FileText} />
      </div>
      {pending > 0 && (
        <Button variant="election" size="election" onClick={() => onGo("applications")} className="flex w-full items-center gap-3 rounded-2xl border border-primary bg-accent p-4 text-left">
          <Clock className="h-6 w-6 text-primary" />
          <span className="flex-1 font-semibold">{pending} application{pending > 1 ? "s" : ""} waiting for review</span>
          <span className="text-sm text-primary">Review →</span>
        </Button>
      )}
      <section className="rounded-3xl border border-primary/40 bg-card p-4">
        <h2 className="font-display text-lg font-bold">Leading per position</h2>
        <div className="mt-3 divide-y divide-border">
          {positions.length === 0 && <p className="py-4 text-sm text-muted-foreground">No approved candidates yet.</p>}
          {positions.map((p) => {
            const list = (candidates ?? []).filter((c) => c.position === p.value);
            const sum = list.reduce((s, c) => s + c.votes, 0);
            const lead = list[0];
            if (!lead) return null;
            const pct = sum ? Math.round((lead.votes / sum) * 100) : 0;
            return (
              <div key={p.value} className="flex items-center gap-3 py-3">
                <CandidatePhoto name={lead.student_name} url={lead.photo_url} className="h-10 w-10 shrink-0 rounded-full text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.label}</p>
                  <p className="truncate font-semibold">{sum ? lead.student_name : "No votes yet"}</p>
                </div>
                <p className="text-right text-sm"><span className="font-bold text-primary">{lead.votes}</span><span className="block text-[11px] text-muted-foreground">{pct}% of {sum}</span></p>
              </div>
            );
          })}
        </div>
        <Link to="/results" className="mt-2 block text-center text-sm text-primary">Open full results →</Link>
      </section>
    </div>
  );
}

function StatusPill({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`rounded-full border px-3 py-1 font-semibold ${on ? "border-success/60 text-success" : "border-destructive/60 text-destructive"}`}>
      {label}: {on ? "Open" : "Closed"}
    </span>
  );
}

function Applications() {
  const qc = useQueryClient();
  const { data } = useAllApps();
  const [status, setStatus] = useState("pending");
  const [q, setQ] = useState("");
  const [pos, setPos] = useState("all");
  const [view, setView] = useState<App | null>(null);
  const [del, setDel] = useState<App | null>(null);
  const [adding, setAdding] = useState(false);

  const list = useMemo(() => (data ?? []).filter((a) =>
    a.status === status && (pos === "all" || a.position === pos) &&
    a.student_name.toLowerCase().includes(q.toLowerCase())), [data, status, q, pos]);

  async function update(id: string, s: string) {
    const { error } = await supabase.from("electoral_applications").update({ status: s, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(s === "pending" ? "Moved back to review" : `Application ${s}`);
    setView(null);
    qc.invalidateQueries();
  }
  async function remove(id: string) {
    const { error } = await supabase.from("electoral_applications").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Candidate removed");
    setDel(null); setView(null);
    qc.invalidateQueries();
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-primary/40 bg-card px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <Button variant="election" size="election" onClick={() => setAdding(true)} className="flex items-center gap-1 rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground"><UserPlus className="h-4 w-4" />Add</Button>
      </div>
      <select value={pos} onChange={(e) => setPos(e.target.value)} className="mt-2 w-full rounded-full border border-primary/40 bg-card px-4 py-2.5 text-sm">
        <option value="all">All positions</option>
        {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["pending", "approved", "rejected"].map((t) => (
          <Button variant="election" size="election" key={t} onClick={() => setStatus(t)} className={`rounded-full border py-2 text-xs font-semibold capitalize ${status === t ? "border-primary bg-gradient-primary text-primary-foreground" : "border-primary/40 text-muted-foreground"}`}>
            {t} ({(data ?? []).filter((a) => a.status === t).length})
          </Button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 && <p className="py-10 text-center text-muted-foreground">Nothing here.</p>}
        {list.map((a) => (
          <div key={a.id} className="rounded-3xl border border-primary/40 bg-card p-4">
            <Button variant="election" size="election" onClick={() => setView(a)} className="flex w-full gap-3 text-left">
              <CandidatePhoto name={a.student_name} url={a.photo_url} className="h-14 w-14 shrink-0 rounded-2xl text-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-bold uppercase">{a.student_name}</p>
                <p className="text-sm text-primary">{positionLabel(a.position)}</p>
                <p className="text-xs text-muted-foreground">{a.class_name} {a.stream_name} · {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <Eye className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Button>
            <Actions a={a} onStatus={update} onDelete={() => setDel(a)} />
          </div>
        ))}
      </div>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-primary/40">
          {view && (
            <>
              <SheetHeader><SheetTitle className="font-display">Application details</SheetTitle></SheetHeader>
              <div className="px-4 pb-6">
                <CandidatePhoto name={view.student_name} url={view.photo_url} className="mx-auto h-28 w-28 rounded-full text-3xl ring-2 ring-primary" />
                <p className="mt-3 text-center font-display text-xl font-bold uppercase">{view.student_name}</p>
                <p className="text-center text-sm text-primary">{positionLabel(view.position)}</p>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <Info k="Class" v={view.class_name} /><Info k="Stream" v={view.stream_name ?? "—"} /><Info k="Age" v={view.age ?? "—"} />
                </dl>
                <h3 className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Experience</h3>
                <p className="text-sm">{view.experience || "—"}</p>
                <h3 className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Manifesto</h3>
                <p className="whitespace-pre-line text-sm">{view.manifesto}</p><ManifestoMedia photos={view.manifesto_photos} video={view.youtube_url} />
                <Actions a={view} onStatus={update} onDelete={() => setDel(view)} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {del?.student_name}?</AlertDialogTitle>
            <AlertDialogDescription>This deletes the application and every vote cast for this candidate. It can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => del && remove(del.id)} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddCandidate open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

function Info({ k, v }: { k: string; v: ReactNode }) {
  return <div className="rounded-xl bg-muted p-2"><dt className="text-[11px] text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>;
}

function Actions({ a, onStatus, onDelete }: { a: App; onStatus: (id: string, s: string) => void; onDelete: () => void }) {
  return (
    <div className="mt-3 flex gap-2">
      {a.status !== "approved" && <Button variant="election" size="election" onClick={() => onStatus(a.id, "approved")} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gradient-primary py-2 text-sm font-semibold text-primary-foreground"><Check className="h-4 w-4" />Approve</Button>}
      {a.status !== "rejected" && <Button variant="election" size="election" onClick={() => onStatus(a.id, "rejected")} className="flex flex-1 items-center justify-center gap-1 rounded-full border border-destructive/60 py-2 text-sm text-destructive"><X className="h-4 w-4" />Reject</Button>}
      {a.status !== "pending" && <Button variant="election" size="election" onClick={() => onStatus(a.id, "pending")} aria-label="Move back to review" className="rounded-full border border-primary/40 px-3 text-muted-foreground"><RotateCcw className="h-4 w-4" /></Button>}
      <Button variant="election" size="election" onClick={onDelete} aria-label="Remove" className="rounded-full border border-destructive/40 px-3 text-destructive"><Trash2 className="h-4 w-4" /></Button>
    </div>
  );
}

function AddCandidate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ student_name: "", class_name: "P6", stream_name: "Orange", age: "", position: POSITIONS[0]?.value ?? "", manifesto: "" });
  const [busy, setBusy] = useState(false);
  const input = "w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary";
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("electoral_applications").insert({
      ...f, age: f.age ? Number(f.age) : null, status: "approved", user_id: null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Candidate added to the ballot");
    setF({ ...f, student_name: "", manifesto: "", age: "" });
    qc.invalidateQueries();
    onClose();
  }
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-primary/40">
        <SheetHeader><SheetTitle className="font-display">Add a candidate</SheetTitle></SheetHeader>
        <form onSubmit={save} className="space-y-3 px-4 pb-6">
          <select required aria-label="Pupil name" value={f.student_name} onChange={(e) => setF({ ...f, student_name: e.target.value })} className={input}><option value="">Select pupil</option>{PUPILS.map(name => <option key={name}>{name}</option>)}</select>
          <div className="grid grid-cols-3 gap-2">
            <select value={f.class_name} onChange={(e) => setF({ ...f, class_name: e.target.value })} className={input}>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select>
            <select value={f.stream_name} onChange={(e) => setF({ ...f, stream_name: e.target.value })} className={input}>{STREAMS.map((c) => <option key={c}>{c}</option>)}</select>
            <select aria-label="Age" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} className={input}><option value="">Age</option>{AGES.map(age => <option key={age}>{age}</option>)}</select>
          </div>
          <select value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} className={input}>
            {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <textarea required rows={4} placeholder="Manifesto" value={f.manifesto} onChange={(e) => setF({ ...f, manifesto: e.target.value })} className={input} />
          <Button variant="election" size="election" disabled={busy} className="w-full rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">Add to ballot</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

type UserRow = { id: string; email: string; full_name: string | null; class_name: string | null; stream_name: string | null; created_at: string; is_admin: boolean; has_voted: boolean };

function UsersPanel({ meId }: { meId: string }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "voted" | "not" | "admins">("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<UserRow[]> => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error;
      return data ?? [];
    },
  });
  const list = (data ?? []).filter((u) => {
    const text = `${u.email} ${u.full_name ?? ""}`.toLowerCase();
    if (!text.includes(q.toLowerCase())) return false;
    if (filter === "voted") return u.has_voted;
    if (filter === "not") return !u.has_voted;
    if (filter === "admins") return u.is_admin;
    return true;
  });

  async function toggleAdmin(u: UserRow) {
    const { error } = u.is_admin
      ? await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin")
      : await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
    if (error) { toast.error(error.message); return; }
    toast.success(u.is_admin ? "Commission access removed" : "Added to the Electoral Commission");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  function exportCsv() {
    const rows = [["Name", "Email", "Class", "Stream", "Voted", "Commission", "Joined"],
      ...(data ?? []).map((u) => [u.full_name ?? "", u.email, u.class_name ?? "", u.stream_name ?? "", u.has_voted ? "Yes" : "No", u.is_admin ? "Yes" : "No", new Date(u.created_at).toLocaleDateString()])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "kps-voters.csv";
    a.click();
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-primary/40 bg-card px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <Button variant="election" size="election" onClick={exportCsv} aria-label="Download list" className="rounded-full border border-primary/40 px-3 text-primary"><Download className="h-4 w-4" /></Button>
      </div>
      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
        {([["all", "All"], ["voted", "Voted"], ["not", "Not voted"], ["admins", "Commission"]] as const).map(([k, l]) => (
          <Button variant="election" size="election" key={k} onClick={() => setFilter(k)} className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold ${filter === k ? "border-primary bg-gradient-primary text-primary-foreground" : "border-primary/40 text-muted-foreground"}`}>{l}</Button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{list.length} of {data?.length ?? 0} accounts</p>
      {error && <p className="mt-4 text-sm text-destructive">{(error as Error).message}</p>}
      <div className="mt-2 space-y-2">
        {isLoading && <div className="h-40 animate-pulse rounded-3xl bg-card" />}
        {list.map((u) => (
          <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-card p-3">
            <CandidatePhoto name={u.full_name || u.email} url={null} className="h-10 w-10 shrink-0 rounded-full text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{u.full_name || "No name yet"}{u.id === meId && <span className="text-primary"> (you)</span>}</p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px] font-semibold uppercase">
                {u.class_name && <span className="rounded-full bg-muted px-2 py-0.5">{u.class_name} {u.stream_name}</span>}
                <span className={`rounded-full px-2 py-0.5 ${u.has_voted ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>{u.has_voted ? "Voted" : "Not voted"}</span>
                {u.is_admin && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-primary">Commission</span>}
              </div>
            </div>
            {u.id !== meId && (
              <Button variant="election" size="election" onClick={() => toggleAdmin(u)} aria-label={u.is_admin ? "Remove commission access" : "Make commission member"} className="rounded-full border border-primary/40 p-2 text-primary">
                {u.is_admin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel() {
  const qc = useQueryClient();
  const { data: s } = useSettings();
  const [note, setNote] = useState<string | null>(null);
  const [reset, setReset] = useState(false);

  async function patch(values: Record<string, unknown>) {
    const { error } = await supabase.from("election_settings").update({ ...values, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    qc.invalidateQueries();
  }
  async function resetVotes() {
    const { error } = await supabase.from("electoral_votes").delete().not("id", "is", null);
    if (error) { toast.error(error.message); return; }
    toast.success("All votes cleared");
    setReset(false);
    qc.invalidateQueries();
  }
  if (!s) return <div className="h-60 animate-pulse rounded-3xl bg-card" />;

  const rows = [
    { key: "voting_open", title: "Voting open", text: "Pupils can cast their ballots." },
    { key: "applications_open", title: "Applications open", text: "Pupils can apply to become candidates." },
    { key: "results_public", title: "Show results to everyone", text: "When off, only the Commission sees vote counts." },
  ] as const;

  return (
    <div className="space-y-4">
      <section className="divide-y divide-border rounded-3xl border border-primary/40 bg-card">
        {rows.map((r) => (
          <label key={r.key} className="flex items-center gap-3 p-4">
            <div className="flex-1"><p className="font-semibold">{r.title}</p><p className="text-xs text-muted-foreground">{r.text}</p></div>
            <Switch checked={s[r.key]} onCheckedChange={(v) => patch({ [r.key]: v })} />
          </label>
        ))}
      </section>
      <section className="rounded-3xl border border-primary/40 bg-card p-4">
        <p className="font-semibold">Voting dates</p>
        <p className="text-xs text-muted-foreground">Votes are only accepted between these times.</p>
        {(["voting_starts_at", "voting_ends_at"] as const).map((k) => (
          <label key={k} className="mt-3 block text-sm">
            {k === "voting_starts_at" ? "Starts" : "Ends"}
            <input type="datetime-local" defaultValue={s[k] ? toLocalInput(s[k] ?? "") : ""}
              onBlur={(e) => patch({ [k]: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="mt-1 w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 outline-none focus:border-primary" />
          </label>
        ))}
      </section>
      <section className="rounded-3xl border border-primary/40 bg-card p-4">
        <p className="font-semibold">Announcement</p>
        <p className="text-xs text-muted-foreground">Shown at the top of the candidates page. Leave empty to hide.</p>
        <textarea rows={3} value={note ?? s.announcement ?? ""} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Voting closes Friday at 4pm"
          className="mt-3 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary" />
        <Button variant="election" size="election" onClick={() => patch({ announcement: (note ?? "").trim() || null })} className="mt-2 w-full rounded-full bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground">Save announcement</Button>
      </section>
      <section className="rounded-3xl border border-destructive/50 bg-card p-4">
        <p className="font-semibold text-destructive">Danger zone</p>
        <p className="text-xs text-muted-foreground">Clear every vote to restart the election. Candidates stay.</p>
        <Button variant="election" size="election" onClick={() => setReset(true)} className="mt-3 w-full rounded-full border border-destructive/60 py-2.5 text-sm font-semibold text-destructive">Reset all votes</Button>
      </section>
      <AlertDialog open={reset} onOpenChange={setReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all votes?</AlertDialogTitle>
            <AlertDialogDescription>Every ballot will be deleted and pupils can vote again. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetVotes} className="bg-destructive text-destructive-foreground">Reset votes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
