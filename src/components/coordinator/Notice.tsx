import { Megaphone, Lock } from "lucide-react";
import { useSettings } from "@/hooks/use-coordinator";

export function Announcement() {
  const { data } = useSettings();
  if (!data?.announcement) return null;
  return (
    <div className="mt-3 flex items-start gap-3 rounded-2xl border border-primary/50 bg-accent p-3 text-sm">
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>{data.announcement}</p>
    </div>
  );
}

export function ClosedCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-16 rounded-3xl border-2 border-primary/60 bg-card p-8 text-center">
      <Lock className="mx-auto h-10 w-10 text-primary" />
      <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{text}</p>
    </div>
  );
}
