import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import StudentsList from "@/pages/admin/StudentsList";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Admin \u00b7 Students | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Admin \u00b7 Students at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Admin \u00b7 Students | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Admin \u00b7 Students at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
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
                    <StudentsList />
                  </RoleBasedRoute>
                </ProtectedRoute>
  );
}
