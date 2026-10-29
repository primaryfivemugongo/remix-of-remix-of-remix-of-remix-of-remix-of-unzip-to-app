import { createFileRoute } from "@tanstack/react-router";
import Legal from "@/pages/Legal";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Legal at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Legal | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Legal at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Legal />
  );
}
