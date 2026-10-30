import { Link } from "@/lib/coordinator/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, CheckCircle2, XCircle, LogOut, ShieldCheck, ChevronRight, KeyRound, Vote } from "lucide-react";
import { AppShell, CandidatePhoto } from "@/components/coordinator/AppShell";
import { supabase } from "@/lib/coordinator/client";
import { useCandidates, useIsAdmin, useMyVotes, useSettings, useUser } from "@/hooks/use-coordinator";
import { positionLabel } from "@/lib/coordinator/rules";
import { Button } from "@/components/ui/button";
import { Gate } from "./Apply";

const STATUS = {
  pending: { icon: Clock, label: "Under review", cls: "text-primary", text: "The Electoral Commission is reviewing your application." },
  approved: { icon: CheckCircle2, label: "Approved", cls: "text-success", text: "Congratulations! You are on the ballot." },
  rejected: { icon: XCircle, label: "Not approved", cls: "text-destructive", text: "Your application was not approved this time." },
} as const;

const input = "w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary";

export default function StatusPage() {
  const { user, ready, name, photoUrl, signOut, userRole } = useUser();
  const qc = useQueryClient();

  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: settings } = useSettings();
  const { data: myVotes } = useMyVotes(user?.id);
  const { data: candidates } = useCandidates();
  const { data: app, isLoading } = useQuery({
    queryKey: ["my-application", user?.id],
    enabled: !!user,
    queryFn: async () => { if (!user) return null; return (await supabase.from("electoral_applications").select("*").eq("user_id", user.id).maybeSingle()).data; },
  });
  if (ready && !user) return <AppShell><Gate text="Sign in to see your account." /></AppShell>;
  const s = app ? STATUS[app.status as keyof typeof STATUS] ?? STATUS.pending : null;

  return (
    <AppShell>
      <section className="mt-2 flex items-center gap-4 rounded-3xl border border-primary/50 bg-card p-5">
        <CandidatePhoto name={name || "?"} url={photoUrl} className="h-16 w-16 shrink-0 rounded-full text-xl ring-2 ring-primary" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-bold">{name}</h1>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          {isAdmin && <span className="mt-1 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">Electoral Commission</span>}
        </div>
      </section>

      {isAdmin && (
        <Link to="/admin" className="mt-4 flex items-center gap-3 rounded-2xl border border-primary bg-accent p-4">
          <ShieldCheck className="h-6 w-6 text-primary" /><span className="flex-1 font-semibold">Open Commission dashboard</span><ChevronRight className="h-5 w-5 text-primary" />
        </Link>
      )}

      <h2 className="mt-6 font-display text-lg font-bold">My ballot</h2>
      <div className="mt-2 rounded-3xl border border-primary/40 bg-card p-4">
        {!myVotes?.length ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">You haven't voted yet.</p>
            {settings?.voting_open && <Link to="/vote" className="mt-3 flex items-center justify-center gap-2 rounded-full bg-gradient-primary py-2.5 font-semibold text-primary-foreground"><Vote className="h-4 w-4" />Go to ballot</Link>}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {myVotes.map((v) => {
              const c = candidates?.find((x) => x.id === v.application_id);
              return (
                <li key={v.position} className="flex items-center gap-3 py-2.5">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  <div className="min-w-0"><p className="text-xs uppercase text-muted-foreground">{positionLabel(v.position)}</p><p className="truncate font-semibold">{c?.student_name ?? "Candidate"}</p></div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <h2 className="mt-6 font-display text-lg font-bold">My application</h2>
      {isLoading ? <div className="mt-2 h-40 animate-pulse rounded-3xl bg-card" /> : !app || !s ? (
        <div className="mt-2 rounded-3xl border border-primary/40 bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">You haven't applied to be a coordinator.</p>
          {settings?.applications_open && <Link to="/apply" className="mt-3 block rounded-full border border-primary/60 py-2.5 font-semibold">Apply for a position</Link>}
        </div>
      ) : (
        <div className="mt-2 rounded-3xl border border-primary/40 bg-card p-5">
          <div className="flex items-center gap-3">
            <CandidatePhoto name={app.student_name} url={app.photo_url} className="h-14 w-14 shrink-0 rounded-2xl text-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-bold uppercase">{app.student_name}</p>
              <p className="text-sm text-primary">{positionLabel(app.position)}</p>
            </div>
          </div>
          <div className={`mt-4 flex items-center gap-2 font-semibold ${s.cls}`}><s.icon className="h-5 w-5" /> {s.label}</div>
          <p className="text-sm text-muted-foreground">{s.text}</p>
          {app.status === "pending" && <Link to="/apply" className="mt-4 block rounded-full border border-primary/60 py-2.5 text-center">Edit application</Link>}
          {app.status === "approved" && <Link to="/candidate/$id" params={{ id: app.id }} className="mt-4 block rounded-full bg-gradient-primary py-2.5 text-center font-semibold text-primary-foreground">View my candidate page</Link>}
        </div>
      )}

      <Link to={userRole === "student" ? "/student/profile" : "/profile"} className="mt-6 block rounded-full border border-primary/60 py-3 text-center">School account settings</Link>
      <Button variant="ghost" onClick={async () => { await qc.cancelQueries(); qc.clear(); await signOut(); }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-destructive/50 py-3 text-destructive">
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </AppShell>
  );
}
