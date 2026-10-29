import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { motion } from "framer-motion";

interface StreamData {
  stream: string;
  present: number;
  total: number;
  rate: number;
}

interface AttendanceByStreamChartProps {
  data: StreamData[];
  onStreamClick?: (stream: string) => void;
}

const COLORS = [
  'hsl(221 83% 53%)',
  'hsl(262 83% 58%)',
  'hsl(142 76% 36%)',
  'hsl(0 84% 60%)',
  'hsl(217 91% 60%)',
  'hsl(245 58% 51%)'
];

export function AttendanceByStreamChart({ data, onStreamClick }: AttendanceByStreamChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance by Stream</CardTitle>
            <span className="text-xs text-muted-foreground">Click to view details</span>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} layout="vertical" margin={{ left: 100, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                dataKey="stream" 
                type="category" 
                width={90}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <p className="text-sm font-semibold">{payload[0].payload.stream}</p>
                        <p className="text-sm text-muted-foreground">
                          Present: {payload[0].value} / {payload[0].payload.total}
                        </p>
                        <p className="text-sm font-medium">
                          Rate: {payload[0].payload.rate}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="rate" 
                radius={[0, 8, 8, 0]}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(data) => onStreamClick?.(data.stream)}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.6}
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
