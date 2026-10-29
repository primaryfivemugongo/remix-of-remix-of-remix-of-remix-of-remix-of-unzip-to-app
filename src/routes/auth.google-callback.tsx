import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { finishGoogleLink, loginWithGoogle } from "@/lib/google.functions";
import { cachePortalLogin } from "@/lib/portal-login";
import { useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/google-callback")({
  validateSearch: (search: Record<string, unknown>) => ({ intent: search.intent === "link" ? "link" as const : undefined }),
  head: () => ({ meta: [
    { title: "Google Sign-In | KPM School Portal" },
    { name: "description", content: "Completing secure Google sign-in for the KPM School Portal." },
    { property: "og:title", content: "Google Sign-In | KPM School Portal" },
    { property: "og:description", content: "Completing secure Google sign-in for the KPM School Portal." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: GoogleCallback,
});

function GoogleCallback() {
  const { intent } = Route.useSearch();
  const login = useServerFn(loginWithGoogle);
  const link = useServerFn(finishGoogleLink);
  const navigate = useNavigate();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Google sign-in did not complete.");
      if (intent === "link") { await link(); navigate("/account-settings", { replace: true }); return; }
      const result = await login({ data: {} });
      if (!result.success) { sessionStorage.setItem("google-match-email", result.email); toast.info(result.message); navigate("/login", { replace: true }); return; }
      cachePortalLogin(result); navigate("/student", { replace: true });
    })().catch((error) => { toast.error(error instanceof Error ? error.message : "Google sign-in failed."); navigate(intent === "link" ? "/account-settings" : "/login", { replace: true }); });
  }, [intent, link, login, navigate]);
  return <main className="min-h-screen grid place-items-center p-6"><p className="text-muted-foreground">Completing Google sign-in…</p></main>;
}