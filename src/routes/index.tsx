import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Home at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Home | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Home at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <RoleBasedRedirect />
                  <Index />
                </ProtectedRoute>
  );
}
