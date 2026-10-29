import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { lovable } from "@/integrations/lovable";
import { getGoogleAccountSettings, beginGoogleLink, finishGoogleLink, cancelGoogleLink, unlinkGoogleAccount, setStudentPortalPassword } from "@/lib/google.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Unlink, ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GoogleAccountSettings() {
  const read = useServerFn(getGoogleAccountSettings);
  const begin = useServerFn(beginGoogleLink);
  const finish = useServerFn(finishGoogleLink);
  const cancel = useServerFn(cancelGoogleLink);
  const unlink = useServerFn(unlinkGoogleAccount);
  const savePassword = useServerFn(setStudentPortalPassword);
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getGoogleAccountSettings>> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const refresh = async () => { try { setAccount(await read()); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "Account settings unavailable."); } };
  useEffect(() => { void refresh(); }, []);
  const changeLink = async () => {
    setBusy(true);
    try {
      if (account?.googleEmail) {
        await unlink({ data: { password } });
        toast.success("Google account unlinked.");
      } else {
        await begin({ data: { password } });
        const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth/google-callback?intent=link`, extraParams: { prompt: "select_account" } });
        if (result.error) throw result.error;
        if (result.redirected) return;
        await finish();
        toast.success("Google account linked.");
      }
      setPassword("");
      await refresh();
    } catch (e) { await cancel().catch(() => {}); toast.error(e instanceof Error ? e.message : "Could not update Google account."); }
    finally { setBusy(false); }
  };
  if (error) return <section className="space-y-3"><p role="alert" className="text-destructive">{error}</p><Button variant="outline" onClick={refresh}>Try again</Button></section>;
  if (!account) return <Loader2 aria-label="Loading account settings" className="h-5 w-5 animate-spin" />;
  return <section className="space-y-6 border-t pt-6" aria-label="Google account settings">
    <div className="space-y-2"><h2 className="text-xl font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Google account</h2><p className="text-muted-foreground">{account.googleEmail ?? "Not linked"}</p></div>
    <form className="space-y-4 max-w-md" onSubmit={(event) => { event.preventDefault(); void changeLink(); }}>
      <Label htmlFor="google-settings-password">Portal password</Label><Input id="google-settings-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy || !account.hasPassword} required />
      <Button type="submit" variant={account.googleEmail ? "outline" : "default"} disabled={busy || !password || !account.hasPassword} className="gap-2">{account.googleEmail ? <Unlink className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}{busy ? "Updating…" : account.googleEmail ? "Unlink Google account" : "Link Google account"}</Button>
      {!account.hasPassword && <p className="text-sm text-muted-foreground">Set a portal password before unlinking Google.</p>}
    </form>
    <form className="space-y-4 border-t pt-6 max-w-md" onSubmit={async (event) => {
      event.preventDefault(); if (newPassword !== confirm) { toast.error("Passwords do not match."); return; } setBusy(true);
      try { await savePassword({ data: { currentPassword: password, newPassword } }); setPassword(""); setNewPassword(""); setConfirm(""); await refresh(); toast.success("Portal password saved."); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Could not save password."); } finally { setBusy(false); }
    }}>
      <h2 className="text-xl font-semibold">{account.hasPassword ? "Change portal password" : "Set portal password"}</h2>
      <Label htmlFor="google-new-password">New password</Label><Input id="google-new-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
      <Label htmlFor="google-confirm-password">Confirm new password</Label><Input id="google-confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
      <Button disabled={busy || (account.hasPassword && !password) || !newPassword || newPassword !== confirm} className="gap-2"><KeyRound className="h-4 w-4" />Save portal password</Button>
    </form>
  </section>;
}