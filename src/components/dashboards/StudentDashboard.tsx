import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { PhotoJumbotron, PhotoJumbotronRef } from "@/components/ui/photo-jumbotron";
import { QuoteModal } from "@/components/ui/quote-modal";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { formatGreetingName, getTimeBasedGreeting } from "@/utils/greetingUtils";
import { getQuoteOfTheDay, getRandomPhotoQuote, PhotoQuote } from "@/utils/photoQuotes";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { 
  BookOpen, 
  ClipboardList, 
  Award, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Loader2,
  Vote,
  Trophy,
  UserCheck,
  Sparkles,
  Star,
  Users,
  Library,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Zap,
  Target,
  Heart,
  Smile,
  User,
  GraduationCap,
  Monitor,
  Quote,
  Gamepad2,
  Image,
  Video,
  Film,
  CalendarClock,
  Shuffle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AccountVerificationForm } from "@/components/auth/AccountVerificationForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "@/lib/router-compat";
import { Confetti } from "@/components/ui/confetti";

export function StudentDashboard() {
  const { userName, isVerified, personalEmail, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const [currentQuote, setCurrentQuote] = useState<PhotoQuote>({ src: '/placeholder.svg', alt: 'Loading quote...' });
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const photoJumbotronRef = useRef<PhotoJumbotronRef>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Get time-based greeting and load quote on component mount
  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    getQuoteOfTheDay().then(setCurrentQuote);
  }, []);

  // Show loading state while authentication is being resolved
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-bounce">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg font-semibold text-muted-foreground">Loading your awesome dashboard... 🚀</p>
        </div>
      </div>
    );
  }
  
  const dashboardSections = [
    {
      id: 'elections',
      title: 'Elections',
      description: 'Vote for your school leaders',
      icon: Vote,
      color: 'from-red-400 to-pink-400',
      stats: 'Voting Open Now!',
      action: 'Vote Now',
      route: '/student/electoral',
      isHighlight: true
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'See your info & achievements',
      icon: User,
      color: 'from-purple-400 to-pink-400',
      stats: 'Profile 95% Complete',
      action: 'Visit Profile',
      route: '/student/profile'
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Never miss important dates!',
      icon: Calendar,
      color: 'from-blue-400 to-cyan-400',
      stats: '3 Events Today',
      action: 'Check Schedule',
      route: '/student/calendar'
    },
    {
      id: 'classes',
      title: 'My Classes',
      description: 'All your subjects in one place',
      icon: BookOpen,
      color: 'from-green-400 to-emerald-400',
      stats: '6 Active Classes',
      action: 'Explore Classes',
      route: '/student/classes'
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: 'Track your homework & projects',
      icon: ClipboardList,
      color: 'from-orange-400 to-red-400',
      stats: '4 Due This Week',
      action: 'Start Working',
      route: '/student/assignments'
    },
    {
      id: 'grades',
      title: 'My Grades',
      description: 'See how awesome you\'re doing!',
      icon: Award,
      color: 'from-yellow-400 to-orange-400',
      stats: 'GPA: 3.75/4.0',
      action: 'View Report',
      route: '/student/grades'
    },
    {
      id: 'timetable',
      title: 'Timetable',
      description: 'Your daily class schedule',
      icon: Clock,
      color: 'from-indigo-400 to-purple-400',
      stats: 'Next: Math at 10:00',
      action: 'See Schedule',
      route: '/student/timetable'
    },
    {
      id: 'attendance',
      title: 'My Attendance',
      description: 'Track your attendance record',
      icon: UserCheck,
      color: 'from-green-400 to-teal-400',
      stats: '85% This Term',
      action: 'View Records',
      route: '/student/attendance'
    },
    {
      id: 'duty-rota',
      title: 'Duty Rota',
      description: 'Weekly teacher duty schedule',
      icon: Calendar,
      color: 'from-cyan-400 to-blue-400',
      stats: 'Term 3 Schedule',
      action: 'View Duty Rota',
      route: '/student/duty-rota'
    },
    {
      id: 'hall-of-fame',
      title: 'Hall of Fame',
      description: 'See the amazing achievers!',
      icon: Trophy,
      color: 'from-yellow-400 to-amber-400',
      stats: 'Top 10 Students',
      action: 'See Stars',
      route: '/student/hall-of-fame'
    },
    {
      id: 'games',
      title: 'Educational Games',
      description: 'Learn while having fun!',
      icon: Gamepad2,
      color: 'from-indigo-400 to-purple-400',
      stats: '12 New Games',
      action: 'Play Now',
      route: '/student/games'
    },
    {
      id: 'gallery',
      title: 'Gallery',
      description: 'Browse amazing photos & memories',
      icon: Image,
      color: 'from-pink-400 to-rose-400',
      stats: 'Latest Updates',
      action: 'View Gallery',
      route: '/student/gallery'
    },
    {
      id: 'e-learning',
      title: 'E-Learning',
      description: 'Watch educational videos & tutorials',
      icon: Video,
      color: 'from-red-400 to-orange-400',
      stats: '100+ Videos',
      action: 'Watch Videos',
      route: '/student/e-learning'
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      description: 'Watch movies & enjoy fun content',
      icon: Film,
      color: 'from-amber-400 to-yellow-400',
      stats: '50+ Movies',
      action: 'Browse Movies',
      route: '/student/entertainment'
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Watch school events & activities',
      icon: CalendarClock,
      color: 'from-purple-400 to-indigo-400',
      stats: 'Latest Events',
      action: 'Browse Events',
      route: '/student/events'
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Discover amazing books & resources',
      icon: Library,
      color: 'from-emerald-400 to-teal-400',
      stats: '500+ Books Available',
      action: 'Browse Books',
      route: '/student/library'
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'Connect with friends & teachers',
      icon: MessageSquare,
      color: 'from-blue-400 to-indigo-400',
      stats: '3 New Messages',
      action: 'Read Messages',
      route: '/student/communication'
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Need help? We\'re here for you!',
      icon: HelpCircle,
      color: 'from-purple-400 to-pink-400',
      stats: '24/7 Support',
      action: 'Get Help',
      route: '/student/help'
    }
  ];

  const quickStats = [
    { label: 'Friends', value: '24', icon: Users, color: 'text-blue-500', route: '/friends', clickable: true },
    { label: 'Friend Requests', value: '3', icon: Heart, color: 'text-pink-500', route: '/friend-requests', clickable: true },
    { label: 'Classmates', value: '35', icon: GraduationCap, color: 'text-green-500', route: '/classmates', clickable: true },
    { label: 'Streammates', value: '142', icon: Monitor, color: 'text-purple-500', route: '/streammates', clickable: true }
  ];

  const handleSectionClick = (route: string, isHighlight?: boolean) => {
    if (isHighlight) {
      setShowConfetti(true);
    }
    navigate(route);
  };

  const scrollToContent = () => {
    const contentElement = document.getElementById('dashboard-content');
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
              {greeting}, {formatGreetingName(userName || '', 'student') || 'Superstar'}! 
              </h1>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Quick Stats */}
      <ScrollReveal animation="fadeInUp" delay={200}>
        <div id="dashboard-content">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard 
                key={stat.label} 
                hoverAnimation={index % 2 === 0 ? 'bounce' : 'wiggle'}
                delay={index * 100}
                className="fun-hover cursor-pointer transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/50 bg-gradient-subtle click-effect"
                onClick={() => navigate(stat.route)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-2 animate-pulse`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  <div className="text-xs text-primary font-medium mt-1">Click to explore</div>
                </CardContent>
              </AnimatedCard>
            );
          })}
        </div>
        </div>
      </ScrollReveal>

      {/* Dashboard Sections Grid */}
      <ScrollReveal animation="fadeInUp" delay={300}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardSections.map((section, index) => {
            const Icon = section.icon;
            const isHovered = hoveredCard === section.id;
            
            // Different animation for each card based on position
            const animations = ['bounce', 'wiggle', 'float', 'zoom', 'rainbow'];
            const cardAnimation = animations[index % animations.length] as any;
            
            return (
              <AnimatedCard 
                key={section.id}
                hoverAnimation={cardAnimation}
                delay={index * 50}
                className={`group fun-hover cursor-pointer click-effect transition-all duration-500 hover:shadow-2xl border-2 hover:border-primary/50 relative overflow-hidden ${
                  section.isHighlight ? 'animate-pulse border-orange-400' : ''
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
                      <Icon className={`h-6 w-6 text-white transition-transform duration-300 ${isHovered ? 'animate-bounce' : ''}`} />
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
                    
                    <AnimatedButton 
                      variant={section.isHighlight ? "default" : "outline"}
                      size="sm" 
                      animation={section.isHighlight ? 'bounce' : 'zoom'}
                      playAnimation={section.isHighlight}
                      className={`group-hover:scale-105 transition-all duration-300 font-bold ${
                        section.isHighlight 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                          : 'hover:bg-primary hover:text-white'
                      }`}
                    >
                      {section.action}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </AnimatedButton>
                  </div>
                  
                  {section.isHighlight && (
                    <div className="text-center">
                      <span className="text-xs font-bold text-orange-600 animate-bounce">
                        HOT! Don't miss out!
                      </span>
                    </div>
                  )}
                </CardContent>
              </AnimatedCard>
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
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <div className="relative rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300 bg-muted">
              <img
                src={currentQuote.src}
                alt={currentQuote.alt}
                className="w-full h-96 object-contain group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm font-medium opacity-90">
                  Click to view, download, or get a new quote
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Confetti Effect */}
      <Confetti isActive={showConfetti} />


      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <AccountVerificationForm 
            userType="student"
            userId={user?.id}
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