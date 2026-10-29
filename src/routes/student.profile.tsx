import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import UserProfile from "@/pages/UserProfile";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "Student \u00b7 Profile | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Student \u00b7 Profile at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Student \u00b7 Profile | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Student \u00b7 Profile at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
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
