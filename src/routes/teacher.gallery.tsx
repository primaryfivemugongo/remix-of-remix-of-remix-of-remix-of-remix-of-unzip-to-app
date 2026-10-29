import { createFileRoute } from "@tanstack/react-router";
import AdminGallery from "@/pages/admin/AdminGallery";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/teacher/gallery")({
  head: () => ({
    meta: [
      { title: "Teacher \u00b7 Gallery | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Teacher \u00b7 Gallery at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Teacher \u00b7 Gallery | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Teacher \u00b7 Gallery at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <AdminGallery />
                </ProtectedRoute>
  );
}
