import { createFileRoute } from "@tanstack/react-router";
import Games from "@/pages/Games";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/student/games/")({
  head: () => ({
    meta: [
      { title: "Student \u00b7 Games | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Student \u00b7 Games at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Student \u00b7 Games | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Student \u00b7 Games at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <Games />
                </ProtectedRoute>
  );
}
