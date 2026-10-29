import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Calendar,
  Building,
  Activity,
  Shield,
  Mail,
  Loader2,
  Layers,
  Clock,
  Film,
  CalendarClock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AccountVerificationForm } from "@/components/auth/AccountVerificationForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@/lib/router-compat";

interface DatabaseStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalStreams: number;
}

export function AdminDashboard() {
  const { userName, isVerified, personalEmail, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DatabaseStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalStreams: 0
  });
  const [electoralStats, setElectoralStats] = useState({
    pending: 0,
    confirmed: 0,
    rejected: 0
  });
  const [loadingElectoral, setLoadingElectoral] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      fetchDashboardStats();
      fetchElectoralStats();
    }
  }, [isLoading, user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [
        { count: totalStudents, error: studentsError },
        { count: totalTeachers, error: teachersError },
        { count: totalClasses, error: classesError },
        { count: totalStreams, error: streamsError }
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('streams').select('*', { count: 'exact', head: true })
      ]);

      if (studentsError || teachersError || classesError || streamsError) {
        console.error('Error fetching stats:', { studentsError, teachersError, classesError, streamsError });
        return;
      }

      setStats({
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        totalClasses: totalClasses || 0,
        totalStreams: totalStreams || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchElectoralStats = async () => {
    try {
      setLoadingElectoral(true);
      
      const [pendingResult, confirmedResult, rejectedResult] = await Promise.all([
        supabase.from('electoral_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('electoral_applications').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('electoral_applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected')
      ]);

      setElectoralStats({
        pending: pendingResult.count || 0,
        confirmed: confirmedResult.count || 0,
        rejected: rejectedResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching electoral stats:', error);
    } finally {
      setLoadingElectoral(false);
    }
  };

  // Show loading state while authentication is being resolved
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const recentActivities = [
    { action: "New student enrolled", user: "John Doe", time: "2 minutes ago", type: "student" },
    { action: "Teacher joined", user: "Dr. Sarah Smith", time: "1 hour ago", type: "teacher" },
    { action: "Quote added", user: "Inspirational Content", time: "3 hours ago", type: "quote" },
    { action: "Payment received", user: "$1,250 from Grade 11", time: "5 hours ago", type: "payment" },
    { action: "Report generated", user: "Monthly Performance", time: "Yesterday", type: "report" },
  ];

  const departmentStats = [
    { name: "Mathematics", teachers: 25, students: 520, performance: 85 },
    { name: "Science", teachers: 22, students: 480, performance: 82 },
    { name: "English", teachers: 20, students: 510, performance: 88 },
    { name: "History", teachers: 18, students: 420, performance: 79 },
    { name: "Computer Science", teachers: 15, students: 380, performance: 91 },
  ];

  const adminSections = [
    {
      id: 'students',
      title: 'Students',
      description: 'Manage student records',
      icon: GraduationCap,
      color: 'from-blue-400 to-cyan-400',
      stats: `${stats.totalStudents} Students`,
      action: 'Manage Students',
      route: '/admin/students'
    },
    {
      id: 'teachers',
      title: 'Teachers',
      description: 'Manage teaching staff',
      icon: Users,
      color: 'from-green-400 to-emerald-400',
      stats: `${stats.totalTeachers} Teachers`,
      action: 'Manage Teachers',
      route: '/admin/teachers'
    },
    {
      id: 'classes',
      title: 'Classes',
      description: 'Manage class structure',
      icon: BookOpen,
      color: 'from-purple-400 to-pink-400',
      stats: `${stats.totalClasses} Classes`,
      action: 'Manage Classes',
      route: '/admin/classes'
    },
    {
      id: 'streams',
      title: 'Streams',
      description: 'Organize student streams',
      icon: Layers,
      color: 'from-indigo-400 to-purple-400',
      stats: `${stats.totalStreams} Streams`,
      action: 'Manage Streams',
      route: '/admin/streams'
    },
    {
      id: 'timetable',
      title: 'Timetable',
      description: 'School schedules & timetables',
      icon: Clock,
      color: 'from-orange-400 to-red-400',
      stats: 'All Schedules',
      action: 'Manage Timetable',
      route: '/admin/timetable'
    },
    {
      id: 'duty-rota',
      title: 'Duty Rota',
      description: 'Teacher duty schedule management',
      icon: Calendar,
      color: 'from-cyan-400 to-blue-400',
      stats: 'Term 3 Roster',
      action: 'View Duty Rota',
      route: '/admin/duty-rota'
    },
    {
      id: 'electoral',
      title: 'Electoral',
      description: 'Manage school elections',
      icon: Shield,
      color: 'from-red-400 to-pink-400',
      stats: `${electoralStats.pending} Pending`,
      action: 'View Applications',
      route: '/admin/electoral-applications',
      isHighlight: electoralStats.pending > 0
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Manage school events and activities',
      icon: CalendarClock,
      color: 'from-purple-400 to-pink-400',
      stats: 'Activities',
      action: 'Manage Events',
      route: '/admin/events'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View school performance',
      icon: BarChart3,
      color: 'from-teal-400 to-green-400',
      stats: 'Reports & Stats',
      action: 'View Analytics',
      route: '/admin/analytics'
    },
    {
      id: 'finance',
      title: 'Finance',
      description: 'Financial management',
      icon: DollarSign,
      color: 'from-yellow-400 to-orange-400',
      stats: 'Payments & Fees',
      action: 'View Finance',
      route: '/admin/finance'
    }
  ];

  const upcomingEvents = [
    { event: "Parent-Teacher Meeting", date: "March 15", status: "upcoming" },
    { event: "Mid-term Examinations", date: "March 20-25", status: "upcoming" },
    { event: "Sports Day", date: "April 2", status: "planned" },
    { event: "Annual Function", date: "April 15", status: "planned" },
  ];

  return (
    <div className="space-y-6">
      <ScrollReveal animation="fadeInUp" delay={100}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
            <p className="text-muted-foreground">School Administration · Kyengera Parents' School - Mugongo</p>
          </div>
        </div>
      </ScrollReveal>


      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <AccountVerificationForm 
            userType="admin"
            userId="00000000-0000-0000-0000-000000000001"
            userName={userName}
            onVerificationComplete={() => {
              setShowVerificationDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Quick Stats Overview */}
      <ScrollReveal animation="fadeInUp" delay={200}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {loading ? <Skeleton className="h-8 w-16" /> : stats.totalStudents}
                  </p>
                </div>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-green-800">
                    {loading ? <Skeleton className="h-8 w-16" /> : stats.totalTeachers}
                  </p>
                </div>
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Classes</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {loading ? <Skeleton className="h-8 w-16" /> : stats.totalClasses}
                  </p>
                </div>
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Streams</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {loading ? <Skeleton className="h-8 w-16" /> : stats.totalStreams}
                  </p>
                </div>
                <Layers className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollReveal>

      {/* Admin Sections Grid - Main Management Cards */}
      <ScrollReveal animation="fadeInUp" delay={250}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            
            return (
              <Card 
                key={section.id}
                className={`group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 ${
                  section.isHighlight ? 'border-red-400 bg-red-50/50' : ''
                }`}
                onClick={() => navigate(section.route)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <CardHeader className="relative z-10 pb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${section.color} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors duration-300">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-4">
                  <p className="text-muted-foreground font-medium">
                    {section.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className={`font-semibold ${section.isHighlight ? 'bg-red-100 text-red-700 animate-pulse' : ''}`}
                    >
                      {section.stats}
                    </Badge>
                    
                    <Button 
                      variant={section.isHighlight ? "default" : "outline"}
                      size="sm" 
                      className="font-medium"
                    >
                      {section.action}
                    </Button>
                  </div>
                  
                  {section.isHighlight && (
                    <div className="text-center">
                      <span className="text-xs font-medium text-red-600">
                        Action Required
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollReveal>

        {/* Electoral Applications Management */}
        <ScrollReveal animation="fadeInUp" delay={300}>
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Electoral Applications Management
              </span>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/electoral-applications')}>
                View Applications
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  {loadingElectoral ? <Skeleton className="h-8 w-12 mx-auto" /> : electoralStats.pending}
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending Review</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {loadingElectoral ? <Skeleton className="h-8 w-12 mx-auto" /> : electoralStats.confirmed}
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">Confirmed</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {loadingElectoral ? <Skeleton className="h-8 w-12 mx-auto" /> : electoralStats.rejected}
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">Rejected</p>
              </div>
            </div>
          </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal animation="fadeInUp" delay={400}>
          <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-gradient-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{event.event}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                  <Badge variant={event.status === "upcoming" ? "default" : "secondary"}>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="fadeInUp" delay={500}>
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">{dept.name}</p>
                  <p className="text-sm text-muted-foreground">Department</p>
                </div>
                <div>
                  <p className="font-semibold">{dept.teachers}</p>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                </div>
                <div>
                  <p className="font-semibold">{dept.students}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{dept.performance}%</p>
                  {dept.performance >= 85 ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : dept.performance >= 75 ? (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}