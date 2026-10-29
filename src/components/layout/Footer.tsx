import { Link } from "@/lib/router-compat";
import { Phone, MapPin, Globe } from "lucide-react";
import { school } from "@/lib/school";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-gradient-dark">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{school.name}</h3>
            <p className="font-medium italic text-primary">"{school.motto}"</p>
            <p className="text-sm text-muted-foreground">{school.className} · {school.location}</p>
            <p className="text-sm text-muted-foreground">{school.hours}</p>
          </div>
          <nav aria-label="School information" className="space-y-3">
            <h3 className="font-semibold text-foreground">School Information</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {[['/about', 'About Us'], ['/classes', 'Our Classes'], ['/disclaimer', 'Disclaimer'], ['/legal', 'Legal'], ['/terms', 'Terms of Service'], ['/privacy', 'Privacy Policy'], ['/cookies', 'Cookie Policy']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-primary">{label}</Link></li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0 space-y-3">
            <h3 className="font-semibold text-foreground">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>{school.location}</span></li>
              <li><a href={school.phoneHref} className="flex items-start gap-2 hover:text-primary"><Phone className="h-4 w-4 shrink-0 mt-0.5" />{school.phone}</a></li>
              <li><a href={school.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-primary"><Globe className="h-4 w-4 shrink-0 mt-0.5" /><span className="min-w-0 break-all">{school.website}</span></a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {school.name} · {school.className}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}