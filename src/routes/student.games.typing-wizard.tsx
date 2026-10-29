import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import TypingWizard from "@/pages/games/TypingWizard";

export const Route = createFileRoute("/student/games/typing-wizard")({
  head: () => ({
    meta: [
      { title: "Student \u00b7 Games \u00b7 Typing Wizard | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Student \u00b7 Games \u00b7 Typing Wizard at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Student \u00b7 Games \u00b7 Typing Wizard | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Student \u00b7 Games \u00b7 Typing Wizard at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <TypingWizard />
                </ProtectedRoute>
  );
}
