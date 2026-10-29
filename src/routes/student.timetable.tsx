import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Timetable from "@/pages/Timetable";

export const Route = createFileRoute("/student/timetable")({
  head: () => ({
    meta: [
      { title: "Student \u00b7 Timetable | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Student \u00b7 Timetable at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Student \u00b7 Timetable | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Student \u00b7 Timetable at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <Timetable />
                </ProtectedRoute>
  );
}
