import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building, 
  TrendingUp,
  BarChart3,
  Calendar,
  Bell,
  Settings,
  FileText,
  Vote,
  ArrowRight,
  Loader2,
  ChevronRight,
  ClipboardList,
  Film,
  Image,
  Video,
  Package,
  DollarSign,
  Library
} from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalStreams: number;
  pendingApplications: number;
  recentActivity: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { userName, photoUrl } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalStreams: 0,
    pendingApplications: 0,
    recentActivity: 0
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    navigate('/login');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [studentsResult, teachersResult, classesResult, streamsResult, applicationsResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('streams').select('id', { count: 'exact', head: true }),
        supabase.from('electoral_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        totalStudents: studentsResult.count || 0,
        totalTeachers: teachersResult.count || 0,
        totalClasses: classesResult.count || 0,
        totalStreams: streamsResult.count || 0,
        pendingApplications: applicationsResult.count || 0,
        recentActivity: 12 // Mock data
      });

      // Mock recent activities
      setRecentActivities([
        {
          id: '1',
          type: 'student',
          message: 'New student registration: John Doe',
          timestamp: '2 minutes ago',
          status: 'success'
        },
        {
          id: '2',
          type: 'application',
          message: '3 new electoral applications submitted',
          timestamp: '15 minutes ago',
          status: 'info'
        },
        {
          id: '3',
          type: 'teacher',
          message: 'Teacher profile updated: Jane Smith',
          timestamp: '1 hour ago',
          status: 'success'
        },
        {
          id: '4',
          type: 'system',
          message: 'System backup completed successfully',
          timestamp: '2 hours ago',
          status: 'success'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    { 
      label: 'Total Students', 
      value: stats.totalStudents, 
      icon: GraduationCap, 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      route: '/admin/students'
    },
    { 
      label: 'Total Teachers', 
      value: stats.totalTeachers, 
      icon: Users, 
      color: 'text-green-500', 
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      route: '/admin/teachers'
    },
    { 
      label: 'Total Classes', 
      value: stats.totalClasses, 
      icon: BookOpen, 
      color: 'text-purple-500', 
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      route: '/admin/classes'
    },
    { 
      label: 'Total Streams', 
      value: stats.totalStreams, 
      icon: Building, 
      color: 'text-orange-500', 
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      route: '/admin/streams'
    }
  ];

  const managementSections = [
    {
      id: 'students',
      title: 'Student Management',
      description: 'Manage student records, enrollment, and profiles',
      icon: GraduationCap,
      color: 'from-blue-400 to-cyan-400',
      route: '/admin/students',
      stats: `${stats.totalStudents} Students`
    },
    {
      id: 'teachers',
      title: 'Teacher Management',
      description: 'Manage teacher profiles and assignments',
      icon: Users,
      color: 'from-green-400 to-emerald-400',
      route: '/admin/teachers',
      stats: `${stats.totalTeachers} Teachers`
    },
    {
      id: 'classes',
      title: 'Class Management',
      description: 'Organize and manage class structures',
      icon: BookOpen,
      color: 'from-purple-400 to-violet-400',
      route: '/admin/classes',
      stats: `${stats.totalClasses} Classes`
    },
    {
      id: 'streams',
      title: 'Stream Management',
      description: 'Manage academic streams and specializations',
      icon: Building,
      color: 'from-orange-400 to-red-400',
      route: '/admin/streams',
      stats: `${stats.totalStreams} Streams`
    },
    {
      id: 'electoral',
      title: 'Electoral Applications',
      description: 'Review and manage student electoral applications',
      icon: Vote,
      color: 'from-indigo-400 to-purple-400',
      route: '/admin/electoral',
      stats: `${stats.pendingApplications} Pending`
    },
    {
      id: 'timetable',
      title: 'Timetable Management',
      description: 'Create and manage class schedules and timetables',
      icon: Calendar,
      color: 'from-teal-400 to-cyan-400',
      route: '/admin/timetable',
      stats: 'Schedule'
    },
    {
      id: 'duty-rota',
      title: 'Duty Rota',
      description: 'Manage staff duty rotas and schedules',
      icon: ClipboardList,
      color: 'from-pink-400 to-rose-400',
      route: '/admin/duty-rota',
      stats: 'Rotations'
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Manage library resources and materials',
      icon: Library,
      color: 'from-amber-400 to-yellow-400',
      route: '/admin/library',
      stats: 'Resources'
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      description: 'Manage entertainment content and events',
      icon: Film,
      color: 'from-violet-400 to-purple-400',
      route: '/admin/entertainment',
      stats: 'Media'
    },
    {
      id: 'gallery',
      title: 'Gallery',
      description: 'Manage school photos and memories',
      icon: Image,
      color: 'from-pink-400 to-rose-400',
      route: '/admin/gallery',
      stats: 'Photos'
    },
    {
      id: 'e-learning',
      title: 'E-Learning',
      description: 'Manage educational videos and resources',
      icon: Video,
      color: 'from-red-400 to-orange-400',
      route: '/admin/e-learning',
      stats: 'Videos'
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Manage school events and activities',
      icon: Film,
      color: 'from-purple-400 to-pink-400',
      route: '/admin/events',
      stats: 'Activities'
    },
    {
      id: 'stock',
      title: 'Stock Management',
      description: 'Manage inventory and supplies',
      icon: Package,
      color: 'from-emerald-400 to-teal-400',
      route: '/admin/stock',
      stats: 'Inventory'
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Manage library resources and materials',
      icon: Library,
      color: 'from-amber-400 to-yellow-400',
      route: '/admin/library',
      stats: 'Resources'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View performance metrics and insights',
      icon: BarChart3,
      color: 'from-blue-400 to-indigo-400',
      route: '/admin/analytics',
      stats: 'Insights'
    },
    {
      id: 'finance',
      title: 'Finance',
      description: 'Manage school finances and payments',
      icon: DollarSign,
      color: 'from-green-400 to-emerald-400',
      route: '/admin/finance',
      stats: 'Financial'
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate and view system reports',
      icon: FileText,
      color: 'from-slate-400 to-gray-400',
      route: '/admin/reports',
      stats: 'Documents'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure system preferences and settings',
      icon: Settings,
      color: 'from-gray-400 to-slate-400',
      route: '/admin/settings',
      stats: 'Configuration'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      userRole="admin" 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userName}. Manage your school system from here.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button onClick={fetchDashboardData}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <Card 
              key={stat.label} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(stat.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Sections */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {managementSections.map((section) => (
            <Card 
              key={section.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => navigate(section.route)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} text-white`}>
                    <section.icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {section.description}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {section.stats}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View All Activity
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/students')}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Add New Student
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/teachers')}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Teachers
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/classes')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create New Class
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/electoral')}>
                  <Vote className="mr-2 h-4 w-4" />
                  Review Applications
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/calendar')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}