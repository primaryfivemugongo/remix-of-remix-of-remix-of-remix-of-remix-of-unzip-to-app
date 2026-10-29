import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Calendar, BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";
import { ReportCard } from "@/components/admin/ReportCard";
import { MobileCardView } from "@/components/admin/ResponsiveTable";

const reportsData = [
  {
    id: 1,
    name: "Student Performance Report",
    description: "Comprehensive analysis of student academic performance",
    type: "Academic",
    lastGenerated: "2024-01-15",
    format: "PDF",
    status: "ready"
  },
  {
    id: 2,
    name: "Financial Summary",
    description: "Monthly financial overview including revenue and expenses",
    type: "Financial",
    lastGenerated: "2024-01-10",
    format: "Excel",
    status: "ready"
  },
  {
    id: 3,
    name: "Attendance Analysis",
    description: "Student and teacher attendance patterns and trends",
    type: "Attendance",
    lastGenerated: "2024-01-12",
    format: "PDF",
    status: "processing"
  },
  {
    id: 4,
    name: "Course Enrollment Statistics",
    description: "Enrollment numbers and popular course analysis",
    type: "Academic",
    lastGenerated: "2024-01-08",
    format: "PDF",
    status: "ready"
  },
  {
    id: 5,
    name: "Teacher Performance Metrics",
    description: "Evaluation metrics and performance indicators for faculty",
    type: "HR",
    lastGenerated: "2024-01-05",
    format: "Excel",
    status: "ready"
  },
  {
    id: 6,
    name: "Infrastructure Utilization",
    description: "Classroom and facility usage analytics",
    type: "Operations",
    lastGenerated: "2024-01-03",
    format: "PDF",
    status: "scheduled"
  }
];

const quickStats = [
  { label: "Total Reports", value: 47, icon: FileText, change: "+5 this month" },
  { label: "Scheduled Reports", value: 12, icon: Calendar, change: "3 pending" },
  { label: "Data Sources", value: 8, icon: BarChart3, change: "All connected" },
  { label: "Report Downloads", value: 234, icon: TrendingUp, change: "+23% this week" }
];

export default function AdminReports() {
  const { userRole, userName, photoUrl, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'scheduled': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Academic': return <BookOpen className="h-4 w-4" />;
      case 'Financial': return <TrendingUp className="h-4 w-4" />;
      case 'HR': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout userRole={userRole || "admin"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports Center</h1>
            <p className="text-muted-foreground">Generate, schedule, and manage institutional reports</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reports List - Desktop */}
        <Card className="hidden sm:block">
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Manage and download your institutional reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportsData.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 rounded-md bg-muted flex-shrink-0">
                      {getTypeIcon(report.type)}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{report.name}</h3>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Last generated: {report.lastGenerated}</span>
                        <span>Format: {report.format}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <div className="flex gap-2">
                      {report.status === 'ready' && (
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        {report.status === 'ready' ? 'Regenerate' : 'Generate'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reports List - Mobile */}
        <MobileCardView title="Available Reports" count={reportsData.length} className="sm:hidden">
          {reportsData.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              getStatusColor={getStatusColor}
              getTypeIcon={getTypeIcon}
            />
          ))}
        </MobileCardView>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>Quick access to commonly used report formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="h-20 sm:h-24 flex-col p-4">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-sm">Academic Summary</span>
              </Button>
              <Button variant="outline" className="h-20 sm:h-24 flex-col p-4">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-sm">Financial Dashboard</span>
              </Button>
              <Button variant="outline" className="h-20 sm:h-24 flex-col p-4">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-sm">Staff Report</span>
              </Button>
              <Button variant="outline" className="h-20 sm:h-24 flex-col p-4">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-sm">Attendance Metrics</span>
              </Button>
              <Button variant="outline" className="h-20 sm:h-24 flex-col p-4">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-sm">Performance Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 sm:h-24 flex-col p-4">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-sm">Custom Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}