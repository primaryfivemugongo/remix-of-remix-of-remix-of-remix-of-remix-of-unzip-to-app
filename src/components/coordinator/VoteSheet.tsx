import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "@/lib/coordinator/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Heart, Loader2 } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/lib/coordinator/client";
import { positionLabel } from "@/lib/coordinator/rules";
import type { Candidate } from "@/hooks/use-coordinator";
import { CandidatePhoto } from "./AppShell";

type Props = {
  candidate: Candidate | null;
  userId: string | undefined;
  onClose: () => void;
  onDone?: (() => void) | undefined;
};

export function VoteSheet({ candidate, userId, onClose, onDone }: Props) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Candidate | null>(null);

  async function confirm() {
    if (!candidate || !userId) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("electoral_votes").insert({
      voter_id: userId,
      position: candidate.position,
      application_id: candidate.id,
    });
    setBusy(false);
    if (error) {
      setError(error.code === "23505" ? "You have already voted for this position." : error.message);
      return;
    }
    await Promise.all([qc.invalidateQueries({ queryKey: ["candidates"] }), qc.invalidateQueries({ queryKey: ["my-votes"] })]);
    setSuccess(candidate);
    onClose();
  }

  return (
    <>
      <Drawer open={!!candidate} onOpenChange={(o) => { if (!o) { setError(null); onClose(); } }}>
        <DrawerContent className="mx-auto max-w-xl border-primary/50 bg-card">
          {candidate && (
            <div className="px-6 pb-8 pt-4 text-center">
              <DrawerTitle className="font-display text-2xl">Confirm your vote</DrawerTitle>
              <DrawerDescription className="mt-1 text-muted-foreground">
                {positionLabel(candidate.position)} — you can only vote once for this position.
              </DrawerDescription>
              <CandidatePhoto name={candidate.student_name} url={candidate.photo_url} className="mx-auto mt-6 h-28 w-28 rounded-full ring-4 ring-primary" />
              <p className="mt-4 font-display text-xl font-bold uppercase">{candidate.student_name}</p>
              <p className="text-sm text-muted-foreground">{candidate.class_name}{candidate.stream_name ? ` · ${candidate.stream_name}` : ""}</p>
              {!userId ? (
                <Link to="/auth" className="mt-6 block rounded-full bg-gradient-primary py-4 font-display text-lg font-semibold text-primary-foreground">
                  Sign in to vote
                </Link>
              ) : (
                <Button variant="election" size="election"
                  onClick={confirm}
                  disabled={busy}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-4 font-display text-lg font-semibold text-primary-foreground shadow-election disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-5 w-5 fill-current" />}
                  Cast my vote
                </Button>
              )}
              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
              <Button variant="election" size="election" onClick={onClose} className="mt-3 w-full rounded-full border border-primary/50 py-3 text-sm">Cancel</Button>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <Dialog open={!!success} onOpenChange={(o) => { if (!o) { setSuccess(null); onDone?.(); } }}>
        <DialogContent className="max-w-sm rounded-3xl border-primary/50 bg-card text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
          <DialogTitle className="font-display text-2xl">Vote recorded!</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Thank you for voting for <span className="font-semibold text-primary">{success?.student_name}</span> as{" "}
            {success && positionLabel(success.position)}. Action Not Words!
          </DialogDescription>
          <Button variant="election" size="election"
            onClick={() => { setSuccess(null); onDone?.(); }}
            className="mt-2 rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground"
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
