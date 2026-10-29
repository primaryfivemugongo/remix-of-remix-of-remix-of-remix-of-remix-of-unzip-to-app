import { createFileRoute } from "@tanstack/react-router";
import MovieDetail from "@/pages/MovieDetail";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/teacher/entertainment/$movieId")({
  head: () => ({
    meta: [
      { title: "Teacher \u00b7 Entertainment \u00b7 Movieid | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Teacher \u00b7 Entertainment \u00b7 Movieid at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Teacher \u00b7 Entertainment \u00b7 Movieid | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Teacher \u00b7 Entertainment \u00b7 Movieid at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <MovieDetail />
                </ProtectedRoute>
  );
}
