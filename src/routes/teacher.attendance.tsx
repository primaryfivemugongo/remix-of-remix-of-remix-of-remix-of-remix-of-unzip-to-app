import { createFileRoute } from "@tanstack/react-router";
import Attendance from "@/pages/Attendance";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/teacher/attendance")({
  head: () => ({
    meta: [
      { title: "Teacher \u00b7 Attendance | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Teacher \u00b7 Attendance at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Teacher \u00b7 Attendance | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Teacher \u00b7 Attendance at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
  );
}
