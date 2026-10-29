import { createFileRoute } from "@tanstack/react-router";
import Terms from "@/pages/Terms";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Terms at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Terms | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Terms at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Terms />
  );
}
