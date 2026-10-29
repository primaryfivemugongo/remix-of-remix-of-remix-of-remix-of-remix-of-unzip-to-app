import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import StudentAttendanceView from "@/pages/student/StudentAttendanceView";

export const Route = createFileRoute("/student/attendance")({
  head: () => ({
    meta: [
      { title: "Student \u00b7 Attendance | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Student \u00b7 Attendance at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Student \u00b7 Attendance | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Student \u00b7 Attendance at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <StudentAttendanceView />
                </ProtectedRoute>
  );
}
