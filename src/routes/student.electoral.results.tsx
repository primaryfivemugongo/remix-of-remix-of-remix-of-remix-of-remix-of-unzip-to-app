import { createFileRoute } from "@tanstack/react-router";
import LiveResults from "@/pages/coordinator/Results";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/student/electoral/results")({
  validateSearch: (s: Record<string, unknown>) => ({ position: typeof s.position === "string" ? s.position : undefined }),
  head: () => ({
    meta: [
      { title: "Student \u00b7 Electoral \u00b7 Results | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Student \u00b7 Electoral \u00b7 Results at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Student \u00b7 Electoral \u00b7 Results | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Student \u00b7 Electoral \u00b7 Results at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                    <LiveResults />
                  
                </ProtectedRoute>
  );
}
