import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Download, Plus } from "lucide-react";
import { PaymentCard } from "@/components/admin/PaymentCard";
import { MobileCardView } from "@/components/admin/ResponsiveTable";

const revenueData = [
  { month: 'Jan', tuition: 45000, fees: 8000, total: 53000 },
  { month: 'Feb', tuition: 47000, fees: 8500, total: 55500 },
  { month: 'Mar', tuition: 49000, fees: 9000, total: 58000 },
  { month: 'Apr', tuition: 51000, fees: 9200, total: 60200 },
  { month: 'May', tuition: 53000, fees: 9500, total: 62500 },
  { month: 'Jun', tuition: 55000, fees: 10000, total: 65000 },
];

const pendingPayments = [
  { id: 1, student: "John Smith", amount: 2500, dueDate: "2024-02-15", status: "overdue" },
  { id: 2, student: "Sarah Johnson", amount: 1800, dueDate: "2024-02-20", status: "pending" },
  { id: 3, student: "Mike Chen", amount: 3200, dueDate: "2024-02-25", status: "pending" },
  { id: 4, student: "Lisa Brown", amount: 2100, dueDate: "2024-03-01", status: "upcoming" },
];

export default function AdminFinance() {
  const { userRole, userName, photoUrl, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-destructive';
      case 'pending': return 'bg-warning';
      case 'upcoming': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  return (
    <DashboardLayout userRole={userRole || "admin"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
            <p className="text-muted-foreground">Manage school finances, payments, and revenue</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$354,200</div>
              <p className="text-xs text-muted-foreground">+18% from last period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$9,600</div>
              <p className="text-xs text-muted-foreground">4 pending payments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$65,000</div>
              <p className="text-xs text-muted-foreground">Target achieved: 92%</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Bank, Card, Cash</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue breakdown by tuition and fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="tuition" fill="hsl(var(--primary))" name="Tuition" />
                  <Bar dataKey="fees" fill="hsl(var(--secondary))" name="Fees" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments - Desktop */}
        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>Students with outstanding payment obligations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-medium truncate">{payment.student}</p>
                    <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 justify-between sm:justify-end">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      <p className="font-bold text-lg">${payment.amount.toLocaleString()}</p>
                    </div>
                    <Button size="sm" variant="outline" className="flex-shrink-0">
                      Follow Up
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments - Mobile */}
        <MobileCardView title="Pending Payments" count={pendingPayments.length} className="lg:hidden">
          {pendingPayments.map((payment) => (
            <PaymentCard 
              key={payment.id} 
              payment={payment} 
              getStatusColor={getStatusColor} 
            />
          ))}
        </MobileCardView>
      </div>
    </DashboardLayout>
  );
}