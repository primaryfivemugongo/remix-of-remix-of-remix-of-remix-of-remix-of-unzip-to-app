import { Button } from "@/components/ui/button";
import { Copy, Facebook, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";

export function ShareBar({ title, url }: { title: string; url?: string }) {
  const link = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const text = encodeURIComponent(title);
  const u = encodeURIComponent(link);
  const items = [
    { label: "X", icon: X, href: `https://twitter.com/intent/tweet?text=${text}&url=${u}` },
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${text}%20${u}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ];
  return (
    <div>
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Share this election</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {items.map(({ label, icon: Icon, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-card text-foreground"><Icon className="h-5 w-5" /></span>
            {label}
          </a>
        ))}
        <Button variant="election" size="election"
          type="button"
          onClick={async () => { await navigator.clipboard.writeText(link).catch(() => {}); toast.success("Link copied"); }}
          className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-card text-foreground"><Copy className="h-5 w-5" /></span>
          Copy link
        </Button>
      </div>
    </div>
  );
}
