import { createFileRoute } from "@tanstack/react-router";
import DutyRota from "@/pages/DutyRota";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/teacher/duty-rota")({
  head: () => ({
    meta: [
      { title: "Teacher \u00b7 Duty Rota | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Teacher \u00b7 Duty Rota at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Teacher \u00b7 Duty Rota | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Teacher \u00b7 Duty Rota at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <DutyRota />
                </ProtectedRoute>
  );
}
