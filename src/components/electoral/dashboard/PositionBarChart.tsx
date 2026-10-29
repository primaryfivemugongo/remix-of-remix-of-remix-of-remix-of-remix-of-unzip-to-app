import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { motion } from "framer-motion";

interface PositionData {
  position: string;
  votes: number;
  percentage: number;
}

interface PositionBarChartProps {
  data: PositionData[];
  onPositionClick: (position: string) => void;
}

const COLORS = ['hsl(221 83% 53%)', 'hsl(262 83% 58%)', 'hsl(217 91% 60%)', 'hsl(245 58% 51%)'];

export function PositionBarChart({ data, onPositionClick }: PositionBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.6,
        delay: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Votes by Position</CardTitle>
          <span className="text-xs text-muted-foreground">Click bar to drill down</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} layout="vertical" margin={{ left: 120, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis 
              dataKey="position" 
              type="category" 
              width={110}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-xl">
                      <p className="text-sm font-semibold">{payload[0].payload.position}</p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].value} votes ({payload[0].payload.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="votes" 
              radius={[0, 8, 8, 0]}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(data) => onPositionClick(data.position)}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.7}
                  className="transition-opacity duration-200"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    </motion.div>
  );
}
