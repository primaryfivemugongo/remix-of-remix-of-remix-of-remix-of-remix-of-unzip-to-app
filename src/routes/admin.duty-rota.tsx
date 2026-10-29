import { createFileRoute } from "@tanstack/react-router";
import DutyRota from "@/pages/DutyRota";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";

export const Route = createFileRoute("/admin/duty-rota")({
  head: () => ({
    meta: [
      { title: "Admin \u00b7 Duty Rota | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Admin \u00b7 Duty Rota at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Admin \u00b7 Duty Rota | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Admin \u00b7 Duty Rota at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["admin"]}>
                    <DutyRota />
                  </RoleBasedRoute>
                </ProtectedRoute>
  );
}
