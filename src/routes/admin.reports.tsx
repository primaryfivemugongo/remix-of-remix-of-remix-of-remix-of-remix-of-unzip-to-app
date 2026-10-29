import { createFileRoute } from "@tanstack/react-router";
import AdminReports from "@/pages/admin/AdminReports";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Admin \u00b7 Reports | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Admin \u00b7 Reports at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Admin \u00b7 Reports | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Admin \u00b7 Reports at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
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
                    <AdminReports />
                  </RoleBasedRoute>
                </ProtectedRoute>
  );
}
