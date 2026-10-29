import { createFileRoute } from "@tanstack/react-router";
import AdminFinance from "@/pages/admin/AdminFinance";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";

export const Route = createFileRoute("/admin/finance")({
  head: () => ({
    meta: [
      { title: "Admin \u00b7 Finance | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Admin \u00b7 Finance at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Admin \u00b7 Finance | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Admin \u00b7 Finance at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
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
                    <AdminFinance />
                  </RoleBasedRoute>
                </ProtectedRoute>
  );
}
