import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ResponsiveTableProps {
  title: string;
  children: ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable({ title, children, emptyMessage = "No data available", className = "" }: ResponsiveTableProps) {
  return (
    <Card className={`hidden lg:block ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              {children}
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileCardViewProps {
  title: string;
  count: number;
  children: ReactNode;
  className?: string;
}

export function MobileCardView({ title, count, children, className = "" }: MobileCardViewProps) {
  return (
    <div className={`lg:hidden w-full space-y-4 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold">{title} ({count})</h3>
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}