import { Card } from "@/components/ui/card";
import { LucideIcon, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface EnhancedMetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtext?: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export const EnhancedMetricsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  subtext,
  iconBg,
  iconColor,
  onClick,
  isLoading = false
}: EnhancedMetricsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
    >
      <Card 
        className={`p-6 shadow-md ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`}
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="text-4xl font-bold text-foreground mb-1">
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              value
            )}
          </div>
          <div className="text-sm text-muted-foreground mb-2">{title}</div>
          {trend && (
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </div>
          )}
          {subtext && !trend && (
            <div className="text-sm text-muted-foreground">{subtext}</div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
    </motion.div>
  );
};
