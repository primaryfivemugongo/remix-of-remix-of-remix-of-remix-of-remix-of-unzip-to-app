import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Candidate from "@/pages/coordinator/Candidate";
export const Route = createFileRoute("/student/electoral/candidate/$id")({
  head: () => ({ meta: [
    { title: "Coordinator candidate | Kyengera Parents’ School Mugongo" },
    { name: "description", content: "Meet a school coordinator candidate and read their manifesto." },
    { property: "og:title", content: "KPM coordinator candidate" },
    { property: "og:description", content: "Candidate details and manifesto for the school coordinator election." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <ProtectedRoute><Candidate /></ProtectedRoute>,
});
