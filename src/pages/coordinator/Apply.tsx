import { useSettings } from "@/hooks/use-coordinator";
import { ClosedCard } from "@/components/coordinator/Notice";
import { Link, useNavigate } from "@/lib/coordinator/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell, CandidatePhoto } from "@/components/coordinator/AppShell";
import { supabase } from "@/lib/coordinator/client";
import { useUser } from "@/hooks/use-coordinator";
import { AGES, PUPILS, CLASSES, STREAMS, fileToSmallDataUrl, positionLabel, positionsForClass } from "@/lib/coordinator/rules";



import { Button } from "@/components/ui/button";

const steps = ["Details", "Position", "Review"];

export default function ApplyPage() {
  const { user, ready, name } = useUser();
  const { data: settings } = useSettings();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [f, setF] = useState({ student_name: name, class_name: "", stream_name: "", age: "", position: "", experience: "", manifesto: "", photo_url: "", youtube_url: "" });
  const [photos, setPhotos] = useState<string[]>([]);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!user) return;
    supabase.from("electoral_applications").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setExistingId(data.id);
      setLocked(data.status !== "pending");
      setF({ student_name: data.student_name, class_name: data.class_name, stream_name: data.stream_name ?? "", age: data.age ? String(data.age) : "", position: data.position, experience: data.experience ?? "", manifesto: data.manifesto, photo_url: data.photo_url ?? "", youtube_url: data.youtube_url ?? "" });
      setPhotos(data.manifesto_photos);
    });
  }, [user]);

  if (settings && !settings.applications_open) {
    return <AppShell><ClosedCard title="Applications are closed" text="The Electoral Commission is no longer accepting new candidates." /></AppShell>;
  }
  if (ready && !user) {
    return <AppShell><Gate text="Sign in to register as a candidate." /></AppShell>;
  }
  if (locked) {
    return <AppShell><Gate text="Your application has already been reviewed." to="/status" cta="View my application" /></AppShell>;
  }

  const positions = positionsForClass(f.class_name);
  const canNext = [
    PUPILS.includes(f.student_name) && f.class_name && f.stream_name,
    f.position,
    true,
  ][step];

  async function submit() {
    if (!user || !PUPILS.includes(f.student_name) || !f.stream_name || !positions.some(p => p.value === f.position)) return;
    setBusy(true);
    const { data: verified, error: authError } = await supabase.auth.getUser();
    if (authError || !verified.user) { setBusy(false); toast.error("Please sign in again before submitting your application."); return; }
    const { data: currentSettings, error: settingsError } = await supabase.from("election_settings").select("applications_open").eq("id", 1).maybeSingle();
    if (settingsError || !currentSettings) { setBusy(false); toast.error("Election settings are unavailable. Please try again shortly."); return; }
    if (!currentSettings.applications_open) { setBusy(false); toast.error("Applications are closed."); return; }
    const row = { user_id: verified.user.id, student_name: f.student_name.trim(), class_name: f.class_name, stream_name: f.stream_name || null, age: f.age ? Number(f.age) : null, position: f.position, experience: f.experience || null, manifesto: f.manifesto.trim(), photo_url: f.photo_url || null, status: "pending", manifesto_photos: photos, youtube_url: f.youtube_url || null };
    const { error } = existingId
      ? await supabase.from("electoral_applications").update({ ...row, updated_at: new Date().toISOString() }).eq("id", existingId)
      : await supabase.from("electoral_applications").insert(row);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Application for ${positionLabel(f.position)} submitted to the Electoral Commission.`);
    qc.invalidateQueries();
    nav({ to: "/status" });
  }

  const input = "w-full rounded-xl border border-input bg-background/50 px-4 py-3 outline-none focus:border-primary";

  return (
    <AppShell>
      <h1 className="mt-2 font-display text-3xl font-bold">{existingId ? "Edit registration" : "Register as a candidate"}</h1>
      <div className="mt-4 flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-gradient-primary" : "bg-card"}`} />
            <p className={`mt-1 text-[11px] uppercase ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4 rounded-3xl border-2 border-primary/50 bg-card p-5">
        {step === 0 && (
          <>
            <label className="mx-auto flex w-fit cursor-pointer flex-col items-center gap-2">
              <div className="relative">
                <CandidatePhoto name={f.student_name || "?"} url={f.photo_url || null} className="h-28 w-28 rounded-full ring-2 ring-primary" />
                <span className="absolute bottom-0 right-0 rounded-full bg-gradient-primary p-2 text-primary-foreground"><Camera className="h-4 w-4" /></span>
              </div>
              <span className="text-xs text-muted-foreground">Add your photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) set("photo_url", await fileToSmallDataUrl(file)); }} />
            </label>
            <select aria-label="Pupil name" className={input} disabled value={f.student_name} onChange={(e) => set("student_name", e.target.value)}><option value="">Select pupil name</option>{PUPILS.map(name => <option key={name}>{name}</option>)}</select>
            <div className="grid grid-cols-2 gap-3">
              <select aria-label="Class" className={input} value={f.class_name} onChange={(e) => { set("class_name", e.target.value); set("position", ""); }}>
                <option value="">Class</option>{CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select aria-label="Stream" className={input} value={f.stream_name} onChange={(e) => set("stream_name", e.target.value)}>
                <option value="">Stream</option>{STREAMS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select aria-label="Age" className={input} value={f.age} onChange={(e) => set("age", e.target.value)}><option value="">Age (optional)</option>{AGES.map(age => <option key={age}>{age}</option>)}</select>
            </div>
          </>
        )}
        {step === 1 && (
          positions.length === 0 ? (
            <p className="text-muted-foreground">There are no coordinator positions open for {f.class_name}. Select a class from P1–P7.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Positions open for {f.class_name}: {positions.length}</p>
              {positions.map((p) => (
                <Button variant="ghost" key={p.value} onClick={() => set("position", p.value)} aria-pressed={f.position === p.value} className={`flex h-auto min-h-24 w-full items-start justify-start gap-3 whitespace-normal rounded-2xl border p-4 text-left ${f.position === p.value ? "border-primary bg-accent" : "border-primary/30"}`}>
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${f.position === p.value ? "border-primary bg-primary text-primary-foreground" : "border-primary/50"}`}>{f.position === p.value && <Check className="h-3 w-3" />}</div>
                  <div className="min-w-0 flex-1 break-words"><p className="font-semibold">{p.label}</p><p className="mt-1 text-sm font-normal leading-relaxed text-muted-foreground">{p.description}</p></div>
                </Button>
              ))}
            </div>
          )
        )}
        {step === 2 && (
          <div className="space-y-2 text-sm">
            <Row k="Name" v={f.student_name} /><Row k="Class" v={`${f.class_name} ${f.stream_name}`} /><Row k="Position" v={positionLabel(f.position)} />
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)} className="flex-1 rounded-full border border-primary/50 py-3">Back</Button>}
        {step < 2 ? (
          <Button variant="ghost" disabled={!canNext} onClick={() => setStep(step + 1)} className="flex-1 rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground disabled:opacity-40">Next</Button>
        ) : (
          <Button variant="ghost" disabled={busy} onClick={submit} className="flex-1 rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground disabled:opacity-40">{existingId ? "Update application" : "Submit application"}</Button>
        )}
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-primary/20 py-2"><span className="shrink-0 text-muted-foreground">{k}</span><span className="min-w-0 break-words text-right font-semibold">{v}</span></div>;
}

export function Gate({ text, to = "/auth", cta = "Sign in" }: { text: string; to?: string; cta?: string }) {
  return (
    <div className="mt-16 rounded-3xl border-2 border-primary/60 bg-card p-8 text-center">
      <p className="font-display text-xl">{text}</p>
      <Link to={to} className="mt-6 block rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground">{cta}</Link>
    </div>
  );
}
