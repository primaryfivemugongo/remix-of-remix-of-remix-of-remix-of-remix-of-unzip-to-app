import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { PieChart as PieChartIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface PositionData {
  position: string;
  votes: number;
  percentage: number;
}

interface VoteDistributionChartProps {
  data: PositionData[];
  onPositionClick?: (position: string) => void;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function VoteDistributionChart({ data, onPositionClick }: VoteDistributionChartProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [endAngle, setEndAngle] = useState(0);

  useEffect(() => {
    if (isInView) {
      // Animate from 0 to 360 degrees clockwise
      const duration = 1200;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const eased = 1 - Math.pow(1 - progress, 3);
        setEndAngle(eased * 360);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            <CardTitle>Vote Distribution by Position</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data}
                dataKey="votes"
                nameKey="position"
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={90 - endAngle}
                outerRadius={100}
                label={(entry) => endAngle > 180 ? `${entry.percentage}%` : ""}
                animationBegin={0}
                animationDuration={0}
                isAnimationActive={false}
                onClick={(data) => onPositionClick?.(data.position)}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "12px"
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
