import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Teacher | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Teacher at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Teacher | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Teacher at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
  );
}
