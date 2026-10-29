import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import Timetable from "@/pages/Timetable";

export const Route = createFileRoute("/admin/timetable")({
  head: () => ({
    meta: [
      { title: "Admin \u00b7 Timetable | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Admin \u00b7 Timetable at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
      { property: "og:title", content: "Admin \u00b7 Timetable | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Admin \u00b7 Timetable at Kyengera Parents' School - Mugongo, Kyengera Mugongo." },
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
                    <Timetable />
                  </RoleBasedRoute>
                </ProtectedRoute>
  );
}
