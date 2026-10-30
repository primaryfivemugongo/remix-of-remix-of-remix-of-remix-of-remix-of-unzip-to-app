import { createFileRoute } from "@tanstack/react-router";
import ApplicationStatus from "@/pages/coordinator/Status";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/student/electoral/status")({
  head: () => ({
    meta: [
      { title: "Student \u00b7 Electoral \u00b7 Status | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Student \u00b7 Electoral \u00b7 Status at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Student \u00b7 Electoral \u00b7 Status | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Student \u00b7 Electoral \u00b7 Status at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <ApplicationStatus />
                </ProtectedRoute>
  );
}
