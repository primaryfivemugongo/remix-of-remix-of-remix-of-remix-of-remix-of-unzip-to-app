import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/layout/Footer";
import { school, schoolClasses, classHasInformation } from "@/lib/school";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Our Classes | Kyengera Parents' School - Mugongo" },
      { name: "description", content: "Pre-school and primary classes at Kyengera Parents' School - Mugongo, from Baby Class to Primary Seven." },
      { property: "og:title", content: "Our Classes | Kyengera Parents' School - Mugongo" },
      { property: "og:description", content: "Pre-school and primary classes at Kyengera Parents' School - Mugongo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">Our Classes</h1>
        <p className="text-muted-foreground mt-2 mb-8">{school.name} · "{school.motto}"</p>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {schoolClasses.map((c) => (
            <Link key={c.slug} to={`/classes/${c.slug}`}>
              <Card className="h-full hover:border-primary transition-colors">
                <CardHeader><CardTitle className="text-lg">{c.name}</CardTitle></CardHeader>
                <CardContent>
                  {classHasInformation(c.slug) ? (
                    <Badge>Stream: {c.streams.join(", ")}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">No information available</span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
