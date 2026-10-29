import { createFileRoute } from "@tanstack/react-router";
import Cookies from "@/pages/Cookies";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Cookies at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Cookies | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Cookies at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Cookies />
  );
}
