import { createFileRoute } from "@tanstack/react-router";
import Disclaimer from "@/pages/Disclaimer";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Disclaimer at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Disclaimer | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Disclaimer at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Disclaimer />
  );
}
