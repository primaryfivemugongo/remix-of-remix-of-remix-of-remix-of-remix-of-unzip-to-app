import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface QuickStatsCardProps {
  icon: string;
  value: string | number;
  label: string;
  IconComponent?: LucideIcon;
  onClick?: () => void;
  isLoading?: boolean;
}

export const QuickStatsCard = ({
  icon,
  value,
  label,
  IconComponent,
  onClick,
  isLoading = false
}: QuickStatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1]
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      <Card 
        className={`p-5 text-center shadow-md ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`}
        onClick={onClick}
      >
        {IconComponent ? (
          <IconComponent className="w-8 h-8 mx-auto mb-3 text-primary" />
        ) : (
          <div className="text-3xl mb-3">{icon}</div>
        )}
        <div className="text-2xl font-bold text-foreground mb-1">
          {isLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : value}
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </Card>
    </motion.div>
  );
};
