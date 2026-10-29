import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface MonthData {
  month: string;
  avgRate: number;
  present: number;
  absent: number;
}

interface MonthlyComparisonChartProps {
  data: MonthData[];
  onMonthClick?: (month: string) => void;
}

export function MonthlyComparisonChart({ data, onMonthClick }: MonthlyComparisonChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Monthly Attendance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <p className="text-sm font-semibold mb-2">{payload[0].payload.month}</p>
                        <p className="text-sm text-green-600">Present: {payload[0].payload.present}</p>
                        <p className="text-sm text-red-600">Absent: {payload[0].payload.absent}</p>
                        <p className="text-sm text-primary font-medium mt-1">
                          Avg Rate: {payload[0].payload.avgRate}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar 
                dataKey="avgRate" 
                fill="hsl(221 83% 53%)" 
                radius={[8, 8, 0, 0]}
                onClick={(data) => onMonthClick?.(data.month)}
                cursor="pointer"
                name="Avg Attendance Rate (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
