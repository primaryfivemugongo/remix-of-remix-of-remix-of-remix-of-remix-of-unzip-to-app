import { createFileRoute } from "@tanstack/react-router";
import ElectoralApplications from "@/pages/coordinator/Commission";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/admin/electoral/applications")({
  head: () => ({
    meta: [
      { title: "Admin \u00b7 Electoral \u00b7 Applications | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Admin \u00b7 Electoral \u00b7 Applications at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Admin \u00b7 Electoral \u00b7 Applications | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Admin \u00b7 Electoral \u00b7 Applications at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                    <ElectoralApplications />
                  
                </ProtectedRoute>
  );
}
