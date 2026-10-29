import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import StreamsList from "@/pages/admin/StreamsList";

export const Route = createFileRoute("/admin/streams")({
  head: () => ({
    meta: [
      { title: "Admin \u00b7 Streams | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Admin \u00b7 Streams at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Admin \u00b7 Streams | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Admin \u00b7 Streams at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["admin"]}>
                    <StreamsList />
                  </RoleBasedRoute>
                </ProtectedRoute>
  );
}
