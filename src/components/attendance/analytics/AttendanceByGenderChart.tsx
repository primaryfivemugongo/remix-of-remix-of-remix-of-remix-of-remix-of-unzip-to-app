import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AttendanceByGenderChartProps {
  data: { name: string; value: number; percentage: number }[];
  onSegmentClick?: (gender: string) => void;
}

const COLORS = {
  Male: 'hsl(221 83% 53%)',
  Female: 'hsl(262 83% 58%)',
};

export function AttendanceByGenderChart({ data, onSegmentClick }: AttendanceByGenderChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <Card className="rounded-xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Attendance by Gender</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={(entry) => onSegmentClick?.(entry.name)}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <p className="text-sm font-semibold">{payload[0].name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payload[0].value} students ({payload[0].payload.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
