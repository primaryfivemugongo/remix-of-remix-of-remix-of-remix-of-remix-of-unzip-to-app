import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import UserProfile from "@/pages/UserProfile";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Settings at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Settings | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Settings at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
  );
}
