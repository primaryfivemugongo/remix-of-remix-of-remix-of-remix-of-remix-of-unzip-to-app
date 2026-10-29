import { useEffect, useState } from "react";
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
  useEffect(() => {
    const email = sessionStorage.getItem("google-match-email");
    sessionStorage.removeItem("google-match-email");
    if (email) setMatchingEmail(email);
  }, []);
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
    <Button type="button" className="google-sign-in w-full" disabled={busy} onClick={start}>
      <span className="google-logo-tile" aria-hidden="true">
        <svg className="google-logo" viewBox="0 0 48 48">
          <path className="google-yellow" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 32.8 14l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5Z" />
          <path className="google-red" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 32.8 14l5.7-5.7A20 20 0 0 0 6.3 14.7Z" />
          <path className="google-green" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.6 5.1A20 20 0 0 0 24 44Z" />
          <path className="google-blue" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.6l6.2 5.2A20 20 0 0 0 44 24c0-1.2-.1-2.4-.4-3.5Z" />
        </svg>
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-base font-medium">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in with Google
      </span>
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