import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Vote from "@/pages/coordinator/Vote";

export const Route = createFileRoute("/student/electoral/vote")({
  validateSearch: (s: Record<string, unknown>) => ({ position: typeof s.position === "string" ? s.position : undefined }),
  head: () => ({
    meta: [
      { title: "Student \u00b7 Electoral \u00b7 Vote | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Student \u00b7 Electoral \u00b7 Vote at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Student \u00b7 Electoral \u00b7 Vote | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Student \u00b7 Electoral \u00b7 Vote at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <Vote />
                </ProtectedRoute>
  );
}
