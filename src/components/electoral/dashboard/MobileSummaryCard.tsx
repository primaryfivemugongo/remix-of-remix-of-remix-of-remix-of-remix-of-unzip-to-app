import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface MobileSummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtext?: string;
  trend?: string;
  delay?: number;
  detailContent?: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
}

export function MobileSummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  trend,
  delay = 0,
  detailContent,
  onClick,
  isLoading = false
}: MobileSummaryCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let startValue = 0;
      const duration = 800;
      const increment = value / (duration / 16);
      
      const timer = setInterval(() => {
        startValue += increment;
        if (startValue >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(startValue));
        }
      }, 16);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <>
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-300 active:scale-95 rounded-xl border-0 shadow-md bg-gradient-to-br from-background to-background/80",
          (detailContent || onClick) && "cursor-pointer hover:shadow-lg"
        )}
        onClick={() => {
          if (onClick) onClick();
          else if (detailContent) setIsOpen(true);
        }}
        role={(detailContent || onClick) ? "button" : undefined}
        tabIndex={(detailContent || onClick) ? 0 : undefined}
        aria-label={(detailContent || onClick) ? `${title}: ${value}. Tap to view details` : undefined}
        onKeyDown={(e) => {
          if ((detailContent || onClick) && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            if (onClick) onClick();
            else if (detailContent) setIsOpen(true);
          }
        }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            {trend && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium truncate">
              {title}
            </p>
            <p className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {isLoading ? <Skeleton className="h-8 w-16" /> : displayValue.toLocaleString()}
            </p>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {subtext}
              </p>
            )}
          </div>
        </div>
      </Card>

      {detailContent && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {title}
              </DialogTitle>
              <DialogDescription>
                Detailed information and breakdown
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {detailContent}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
