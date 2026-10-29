import { createFileRoute } from "@tanstack/react-router";
import { VerifyCallback } from "@/pages/VerifyCallback";

export const Route = createFileRoute("/verify-callback")({
  head: () => ({
    meta: [
      { title: "Verify Callback | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Verify Callback at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Verify Callback | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Verify Callback at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <VerifyCallback />
  );
}
