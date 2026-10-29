import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { motion } from "framer-motion";

interface TurnoutItem {
  position: string;
  percentage: number;
  color: string;
}

interface TurnoutCardProps {
  data: TurnoutItem[];
  onClick?: (position: string) => void;
}

export const TurnoutCard = ({ data, onClick }: TurnoutCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-5">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Voter Turnout by Position</h3>
      </div>

      <div className="space-y-5">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="cursor-pointer hover:bg-accent/50 p-2 -m-2 rounded-lg transition-colors"
            onClick={() => onClick?.(item.position)}
          >
            <div className="flex justify-between mb-2 text-sm">
              <span className="font-semibold text-foreground">{item.position}</span>
              <span className="text-muted-foreground">{item.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: item.color
                }}
                initial={{ width: 0 }}
                whileInView={{ width: `${item.percentage}%` }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 1, 
                  delay: index * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
    </motion.div>
  );
};
