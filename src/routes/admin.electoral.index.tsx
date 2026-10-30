import { createFileRoute } from "@tanstack/react-router";
import ElectoralDashboard from "@/pages/coordinator/Commission";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/admin/electoral/")({
  head: () => ({
    meta: [
      { title: "Admin \u00b7 Electoral | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Admin \u00b7 Electoral at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Admin \u00b7 Electoral | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Admin \u00b7 Electoral at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                    <ElectoralDashboard />
                  
                </ProtectedRoute>
  );
}
