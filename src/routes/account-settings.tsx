import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GoogleAccountSettings } from "@/components/profile/GoogleAccountSettings";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/account-settings")({
  head: () => ({ meta: [
    { title: "Account Settings | KPM School Portal" },
    { name: "description", content: "Securely link or unlink Google from your KPM student portal account." },
    { property: "og:title", content: "Account Settings | KPM School Portal" },
    { property: "og:description", content: "Securely link or unlink Google from your KPM student portal account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

function Page() { return <ProtectedRoute><AccountSettings /></ProtectedRoute>; }
function AccountSettings() {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  if (userRole !== "student") return <Navigate to={`/${userRole ?? "login"}`} replace />;
  return <DashboardLayout userRole="student" userName={userName} photoUrl={photoUrl} onLogout={signOut}>
    <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold">Account settings</h1><p className="text-muted-foreground">Manage how you sign in to your student portal account.</p></div><GoogleAccountSettings /></div>
  </DashboardLayout>;
}