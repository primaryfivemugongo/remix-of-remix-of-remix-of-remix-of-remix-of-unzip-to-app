import { createFileRoute } from "@tanstack/react-router";
import Library from "@/pages/Library";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/student/library")({
  head: () => ({
    meta: [
      { title: "Student \u00b7 Library | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Student \u00b7 Library at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Student \u00b7 Library | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Student \u00b7 Library at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
  );
}
