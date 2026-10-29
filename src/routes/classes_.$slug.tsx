import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { schoolClasses, classHasInformation, activeStream } from "@/lib/school";

export const Route = createFileRoute("/classes_/$slug")({
  head: ({ params }) => {
    const name = schoolClasses.find((c) => c.slug === params.slug)?.name ?? "Class";
    return {
      meta: [
        { title: `${name} | Kyengera Parents' School - Mugongo` },
        { name: "description", content: `${name} at Kyengera Parents' School - Mugongo.` },
        { property: "og:title", content: `${name} | Kyengera Parents' School - Mugongo` },
        { property: "og:description", content: `${name} at Kyengera Parents' School - Mugongo.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ClassPage,
});

function ClassPage() {
  const { slug } = Route.useParams();
  const cls = schoolClasses.find((c) => c.slug === slug);
  const active = classHasInformation(slug);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/classes" className="text-primary text-sm">← All classes</Link>
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-2xl">{cls?.name ?? "Unknown class"}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            {active ? (
              <>
                <p>Stream <strong className="text-foreground">{activeStream.stream}</strong> has {activeStream.pupils} pupils with records available on this portal.</p>
                <Button asChild><Link to="/login">Sign in to {activeStream.label}</Link></Button>
              </>
            ) : (
              <>
                <p>No information is currently available for this class. Only Primary Five (Stream: Orange) records have been published at this time.</p>
                <Button asChild variant="outline"><Link to={`/classes/${activeStream.classSlug}`}>View P.5 Orange</Link></Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
