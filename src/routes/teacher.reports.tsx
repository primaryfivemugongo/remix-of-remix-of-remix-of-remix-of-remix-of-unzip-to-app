import { createFileRoute } from "@tanstack/react-router";
import AdminReports from "@/pages/admin/AdminReports";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/teacher/reports")({
  head: () => ({
    meta: [
      { title: "Teacher \u00b7 Reports | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Teacher \u00b7 Reports at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Teacher \u00b7 Reports | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Teacher \u00b7 Reports at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <AdminReports />
                </ProtectedRoute>
  );
}
