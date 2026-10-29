import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface TrendData {
  date: string;
  rate: number;
  present: number;
  total: number;
}

interface AttendanceTrendChartProps {
  data: TrendData[];
  onDateClick?: (date: string) => void;
}

export function AttendanceTrendChart({ data, onDateClick }: AttendanceTrendChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Attendance Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <p className="text-sm font-semibold mb-1">{payload[0].payload.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Present: {payload[0].payload.present} / {payload[0].payload.total}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          Rate: {payload[0].value}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="hsl(221 83% 53%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(221 83% 53%)', r: 4 }}
                activeDot={{ r: 6 }}
                name="Attendance Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
