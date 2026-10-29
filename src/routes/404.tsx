import { createFileRoute } from "@tanstack/react-router";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: "404 | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "404 at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "404 | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "404 at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <NotFound />
  );
}
