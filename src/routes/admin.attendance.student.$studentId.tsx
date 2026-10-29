import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import StudentAttendanceSummary from "@/pages/admin/StudentAttendanceSummary";

export const Route = createFileRoute("/admin/attendance/student/$studentId")({
  head: () => ({
    meta: [
      { title: "Admin \u00b7 Attendance \u00b7 Student \u00b7 Studentid | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Admin \u00b7 Attendance \u00b7 Student \u00b7 Studentid at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Admin \u00b7 Attendance \u00b7 Student \u00b7 Studentid | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Admin \u00b7 Attendance \u00b7 Student \u00b7 Studentid at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["admin"]}>
                    <StudentAttendanceSummary />
                  </RoleBasedRoute>
                </ProtectedRoute>
  );
}
