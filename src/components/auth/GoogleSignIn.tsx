import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { lovable } from "@/integrations/lovable";
import { loginWithGoogle } from "@/lib/google.functions";
import { cachePortalLogin } from "@/lib/portal-login";
import { useNavigate } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GoogleSignIn() {
  const complete = useServerFn(loginWithGoogle);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [matchingEmail, setMatchingEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const finish = async (portalPassword?: string) => {
    const result = await complete({ data: { password: portalPassword } });
    if (!result.success) { setMatchingEmail(result.email); return; }
    cachePortalLogin(result);
    setPassword("");
    setMatchingEmail(null);
    toast.success(`Welcome, ${result.name}!`);
    navigate("/student", { replace: true });
  };
  const start = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth/google-callback`, extraParams: { prompt: "select_account" } });
      if (result.error) throw result.error;
      if (result.redirected) return;
      await finish();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Google sign-in failed."); }
    finally { setBusy(false); }
  };
  return <>
    <Button type="button" variant="outline" className="w-full gap-2" disabled={busy} onClick={start}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span aria-hidden="true" className="font-bold text-primary">G</span>}
      Continue with Google
    </Button>
    <Dialog open={matchingEmail !== null} onOpenChange={(open) => { if (!open) { setMatchingEmail(null); setPassword(""); } }}>
      <DialogContent><DialogHeader><DialogTitle>Link your existing student account</DialogTitle><DialogDescription>{matchingEmail}</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); try { await finish(password); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not link Google."); } finally { setBusy(false); } }}>
          <Label htmlFor="google-match-password">Existing portal password</Label><Input id="google-match-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button className="w-full" disabled={busy || !password}>{busy ? "Linking…" : "Link Google and sign in"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}