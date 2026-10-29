import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtext?: string;
  trend?: string;
  delay?: number;
  className?: string;
  isLoading?: boolean;
}

export function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  trend,
  delay = 0,
  className,
  isLoading = false
}: SummaryCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

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

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const secondsAgo = Math.floor((Date.now() - lastUpdate) / 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={cn(
        "relative overflow-hidden rounded-2xl border-0 shadow-md bg-gradient-to-br from-background to-background/80",
        className
      )}>
        <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {trend && (
            <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2 font-medium">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {isLoading ? <Skeleton className="h-10 w-24" /> : displayValue.toLocaleString()}
          </p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-2 font-medium">{subtext}</p>
          )}
          {!isLoading && (
            <p className="text-xs text-muted-foreground/60 mt-1">
              Updated {secondsAgo}s ago
            </p>
          )}
        </div>
      </div>
    </Card>
    </motion.div>
  );
}
