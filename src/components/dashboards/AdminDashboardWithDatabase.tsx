import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfessionalCard } from "@/components/ui/professional-card";
import { ProfessionalButton } from "@/components/ui/professional-button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PhotoJumbotron, PhotoJumbotronRef } from "@/components/ui/photo-jumbotron";
import { QuoteModal } from "@/components/ui/quote-modal";
import { formatGreetingName, getTimeBasedGreeting } from "@/utils/greetingUtils";
import { getQuoteOfTheDay, getRandomPhotoQuote, PhotoQuote } from "@/utils/photoQuotes";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
  Vote,
  Sparkles,
  Star,
  Heart,
  Smile,
  Quote,
  ArrowRight,
  Target,
  Settings,
  FileText,
  Database,
  ClipboardList,
  Image,
  UserCheck,
  Package,
  Video,
  Film,
  CalendarClock,
  Library,
  Shuffle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AccountVerificationForm } from "@/components/auth/AccountVerificationForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@/lib/router-compat";
import { Confetti } from "@/components/ui/confetti";

interface DatabaseStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalStreams: number;
}

export function AdminDashboard() {
  const { userName, isVerified, personalEmail, user, isLoading } = useAuth();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const [currentQuote, setCurrentQuote] = useState<PhotoQuote>({ src: '/placeholder.svg', alt: 'Loading quote...' });
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const photoJumbotronRef = useRef<PhotoJumbotronRef>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const navigate = useNavigate();

  // Load quote on mount
  useEffect(() => {
    getQuoteOfTheDay().then(setCurrentQuote);
  }, []);

  // Get time-based greeting on component mount
  useEffect(() => {
    fetchDashboardStats();
    setGreeting(getTimeBasedGreeting());
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      
      console.log('Fetching dashboard stats...');
      
      // Use count queries instead of selecting all records to avoid the 1000 row limit
      const [studentsResult, teachersResult, classesResult, streamsResult] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('streams').select('*', { count: 'exact', head: true })
      ]);

      console.log('Stats results:', {
        students: studentsResult,
        teachers: teachersResult,
        classes: classesResult,
        streams: streamsResult
      });

      // Check for errors and set counts using the count property
      if (studentsResult.error) console.error('Students query error:', studentsResult.error);
      if (teachersResult.error) console.error('Teachers query error:', teachersResult.error);
      if (classesResult.error) console.error('Classes query error:', classesResult.error);
      if (streamsResult.error) console.error('Streams query error:', streamsResult.error);

      setStats({
        totalStudents: studentsResult.count || 0,
        totalTeachers: teachersResult.count || 0,
        totalClasses: classesResult.count || 0,
        totalStreams: streamsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalStreams: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Show loading state while authentication is being resolved
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-bounce">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg font-semibold text-muted-foreground">Loading admin control panel...</p>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      id: 'electoral',
      title: 'Electoral Applications',
      description: 'Manage student electoral applications',
      icon: Vote,
      color: 'from-indigo-400 to-purple-400',
      stats: 'Electoral Management',
      action: 'View Applications',
      route: '/admin/electoral'
    },
    {
      id: 'students',
      title: 'Students',
      description: 'Manage all student records and data',
      icon: GraduationCap,
      color: 'from-green-400 to-emerald-400',
      stats: stats ? `${stats.totalStudents} Students` : 'Loading...',
      action: 'Manage Students',
      route: '/admin/students'
    },
    {
      id: 'teachers',
      title: 'Teachers',
      description: 'Oversee teaching staff and assignments',
      icon: Users,
      color: 'from-purple-400 to-pink-400',
      stats: stats ? `${stats.totalTeachers} Teachers` : 'Loading...',
      action: 'Manage Teachers',
      route: '/admin/teachers'
    },
    {
      id: 'gallery',
      title: 'Gallery',
      description: 'Browse and manage photo gallery',
      icon: Image,
      color: 'from-orange-400 to-red-400',
      stats: 'Photo Management',
      action: 'Manage Gallery',
      route: '/admin/gallery'
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Manage library resources and materials',
      icon: Library,
      color: 'from-amber-400 to-yellow-400',
      stats: 'Resources',
      action: 'Manage Library',
      route: '/admin/library'
    },
    {
      id: 'e-learning',
      title: 'E-Learning',
      description: 'Manage educational video content',
      icon: Video,
      color: 'from-red-400 to-pink-400',
      stats: '100+ Educational Videos',
      action: 'Manage Videos',
      route: '/admin/e-learning'
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      description: 'Browse movies & entertainment content',
      icon: Film,
      color: 'from-purple-400 to-indigo-400',
      stats: '50+ Movies Available',
      action: 'Browse Movies',
      route: '/admin/entertainment'
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
      id: 'stock',
      title: 'Stock Management',
      description: 'Track school materials and inventory',
      icon: Package,
      color: 'from-amber-400 to-orange-400',
      stats: 'Inventory Tracking',
      action: 'Manage Stock',
      route: '/admin/stock'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View performance and usage analytics',
      icon: BarChart3,
      color: 'from-teal-400 to-green-400',
      stats: 'Data Insights',
      action: 'View Analytics',
      route: '/admin/analytics',
      isHighlight: true
    },
    {
      id: 'finance',
      title: 'Finance',
      description: 'Manage school finances and fees',
      icon: DollarSign,
      color: 'from-indigo-400 to-purple-400',
      stats: 'Financial Data',
      action: 'View Finance',
      route: '/admin/finance'
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate comprehensive school reports',
      icon: FileText,
      color: 'from-emerald-400 to-teal-400',
      stats: 'Report Center',
      action: 'View Reports',
      route: '/admin/reports'
    },
    {
      id: 'timetable',
      title: 'Timetable',
      description: 'Create and manage class schedules and timetables',
      icon: Calendar,
      color: 'from-teal-400 to-cyan-400',
      stats: 'Schedule Management',
      action: 'Manage Timetable',
      route: '/admin/timetable'
    },
    {
      id: 'duty-rota',
      title: 'Duty Rota',
      description: 'Manage staff duty rotas and schedules',
      icon: ClipboardList,
      color: 'from-pink-400 to-rose-400',
      stats: 'Rotation Management',
      action: 'Manage Duty Rota',
      route: '/admin/duty-rota'
    },
    {
      id: 'attendance',
      title: 'Attendance',
      description: 'Monitor and manage student attendance',
      icon: UserCheck,
      color: 'from-emerald-400 to-teal-400',
      stats: 'Attendance Tracking',
      action: 'View Attendance',
      route: '/admin/attendance'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure system settings and preferences',
      icon: Settings,
      color: 'from-gray-400 to-slate-400',
      stats: 'Configuration',
      action: 'Open Settings',
      route: '/settings'
    }
  ];

  const quickStats = stats ? [
    { label: 'Total Students', value: stats.totalStudents.toString(), icon: GraduationCap, color: 'text-blue-500', route: '/admin/students', clickable: true },
    { label: 'Total Teachers', value: stats.totalTeachers.toString(), icon: Users, color: 'text-green-500', route: '/admin/teachers', clickable: true },
    { label: 'Total Classes', value: stats.totalClasses.toString(), icon: BookOpen, color: 'text-purple-500', route: '/admin/classes', clickable: true },
    { label: 'Total Streams', value: stats.totalStreams.toString(), icon: Building, color: 'text-orange-500', route: '/admin/streams', clickable: true }
  ] : [];

  const handleSectionClick = (route: string, isHighlight?: boolean) => {
    if (isHighlight) {
      setShowConfetti(true);
    }
    navigate(route);
  };

  const scrollToContent = () => {
    const contentElement = document.getElementById('admin-dashboard-content');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Hero Welcome Section with Photo Jumbotron */}
      <ScrollReveal animation="fadeInUp" delay={100}>
        <div className="relative overflow-hidden rounded-xl shadow-2xl">
          <PhotoJumbotron ref={photoJumbotronRef} onScrollDown={scrollToContent} />
          
          {/* Greeting Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
            <div className="relative z-10 text-center space-y-4 pt-8 md:pt-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-orange-500 px-4 font-poppins drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
              {greeting}, {formatGreetingName(userName || '', 'admin') || 'Administrator'}! 
              </h1>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Divider */}
      <ScrollReveal animation="fadeInUp" delay={175}>
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent">
          
          {/* Professional Corner Elements - Hidden on mobile */}
          <div className="hidden md:block absolute top-4 left-4 opacity-20">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div className="hidden md:block absolute top-4 right-4 opacity-20">
            <Settings className="h-5 w-5 text-white" />
          </div>
        </div>
      </ScrollReveal>

      {/* Quick Stats */}
      <ScrollReveal animation="fadeInUp" delay={200}>
        <div id="admin-dashboard-content" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <ProfessionalCard 
                  key={stat.label} 
                  variant="elevated"
                  onClick={() => navigate(stat.route)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    <div className="text-xs text-primary font-medium mt-1">View details</div>
                  </CardContent>
                </ProfessionalCard>
              );
            })
          )}
        </div>
      </ScrollReveal>

      {/* Dashboard Sections Grid */}
      <ScrollReveal animation="fadeInUp" delay={300}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            const isHovered = hoveredCard === section.id;
            
            return (
              <ProfessionalCard 
                key={section.id}
                variant="bordered"
                className={`group relative overflow-hidden ${
                  section.isHighlight ? 'border-primary/50 bg-primary/5' : ''
                }`}
                onMouseEnter={() => setHoveredCard(section.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleSectionClick(section.route, section.isHighlight)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <CardHeader className="relative z-10 pb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${section.color} transition-transform duration-300`}>
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
                      className={`font-semibold ${section.isHighlight ? 'bg-orange-100 text-orange-700 animate-pulse' : ''}`}
                    >
                      {section.stats}
                    </Badge>
                    
                    <ProfessionalButton 
                      variant={section.isHighlight ? "default" : "outline"}
                      size="sm" 
                      className={`font-medium ${
                        section.isHighlight 
                          ? 'bg-primary hover:bg-primary/90' 
                          : ''
                      }`}
                    >
                      {section.action}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </ProfessionalButton>
                  </div>
                  
                  {section.isHighlight && (
                    <div className="text-center">
                      <span className="text-xs font-bold text-orange-600 animate-bounce">
                        High Priority!
                      </span>
                    </div>
                  )}
                </CardContent>
              </ProfessionalCard>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Quote of the Day */}
      <ScrollReveal animation="fadeInUp" delay={400}>
        <Card 
          className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden relative"
          onClick={() => setIsQuoteModalOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Quote className="h-6 w-6 text-primary" />
                Quote of the Day
              </CardTitle>
              <Badge variant="secondary" className="font-semibold">
                Inspiration
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="relative rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <img
                src={currentQuote.src}
                alt={currentQuote.alt}
                className="w-full h-96 object-contain group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm font-medium opacity-90">
                  Click to view, download, or get a new quote
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        quote={currentQuote}
        onNewQuote={async () => {
          const newQuote = await getRandomPhotoQuote();
          setCurrentQuote(newQuote);
        }}
      />
    </div>
  );
}