import { createFileRoute } from "@tanstack/react-router";
import Privacy from "@/pages/Privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Privacy at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Privacy | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Privacy at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Privacy />
  );
}
