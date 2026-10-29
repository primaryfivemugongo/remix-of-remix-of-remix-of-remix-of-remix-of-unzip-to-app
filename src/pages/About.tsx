import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import { school, activeStream } from "@/lib/school";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/login" className="inline-flex items-center text-primary hover:text-primary-hover mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">About {school.name}</CardTitle>
            <p className="text-primary font-medium italic">"{school.motto}"</p>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <p className="text-lg">{school.profile}</p>
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Our Mission</h2>
              <p>{school.mission}</p>
            </section>
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Core Values</h2>
              <ul className="space-y-2">
                {school.values.map(([v, d]) => (
                  <li key={v}><strong className="text-foreground">{v}:</strong> {d}</li>
                ))}
              </ul>
            </section>
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Head Teacher</h2>
              <p>{school.headTeacher} leads the school, supported by committed directors, administrators, parents and staff. {school.name} is part of the {school.network} family.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Classes</h2>
              <p>The school runs pre-school (Baby, Middle and Top class) and primary (P.1 to P.7). Online records are currently available for the {activeStream.label} stream ({activeStream.pupils} pupils). <Link to="/classes" className="text-primary">See all classes</Link>.</p>
            </section>
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Contact the School</h2>
              <p><strong>Location:</strong> {school.location}</p>
              <p><strong>Phone:</strong> <a href={school.phoneHref} className="text-primary">{school.phone}</a> · <a href={school.officePhoneHref} className="text-primary">{school.officePhone}</a></p>
              <p><strong>Hours:</strong> {school.hours}</p>
              <p><strong>Website:</strong> <a href={school.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary break-all">{school.website}</a></p>
            </section>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
