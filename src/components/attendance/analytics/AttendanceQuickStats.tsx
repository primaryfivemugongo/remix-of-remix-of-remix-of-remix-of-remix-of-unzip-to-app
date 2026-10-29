import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface QuickStat {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: number;
  onClick?: () => void;
}

interface AttendanceQuickStatsProps {
  stats: QuickStat[];
}

export function AttendanceQuickStats({ stats }: AttendanceQuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card 
              className={`p-4 text-center shadow-md ${stat.onClick ? 'cursor-pointer hover:shadow-xl transition-all' : ''}`}
              onClick={stat.onClick}
            >
              <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              {stat.trend !== undefined && (
                <div className={`text-xs mt-1 font-medium ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend >= 0 ? '↑' : '↓'} {Math.abs(stat.trend)}%
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
