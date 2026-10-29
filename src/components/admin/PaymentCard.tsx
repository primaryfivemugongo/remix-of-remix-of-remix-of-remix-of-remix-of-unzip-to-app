import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign } from "lucide-react";

interface Payment {
  id: number;
  student: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface PaymentCardProps {
  payment: Payment;
  getStatusColor: (status: string) => string;
}

export function PaymentCard({ payment, getStatusColor }: PaymentCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate">
                {payment.student}
              </h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>Due: {payment.dueDate}</span>
              </div>
            </div>
            <Badge className={`${getStatusColor(payment.status)} shrink-0`}>
              {payment.status}
            </Badge>
          </div>
          
          {/* Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold text-primary">
                ${payment.amount.toLocaleString()}
              </span>
            </div>
            <Button size="sm" variant="outline">
              Follow Up
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}