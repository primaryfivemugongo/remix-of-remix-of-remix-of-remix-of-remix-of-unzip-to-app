import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "About at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "About | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "About at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <About />
  );
}
