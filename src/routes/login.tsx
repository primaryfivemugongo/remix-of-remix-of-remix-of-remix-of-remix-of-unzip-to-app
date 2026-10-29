import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | KPM School Portal" },
      { name: "description", content: "Sign in to the KPM School Portal." },
      { property: "og:title", content: "Login | KPM School Portal" },
      { property: "og:description", content: "Sign in to the KPM School Portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LoginPage />
  );
}
