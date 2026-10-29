import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnimatedCard } from "@/components/ui/animated-card";
import { useAuth } from "@/hooks/useAuth";
import { 
  HelpCircle, 
  Search, 
  BookOpen,
  Video,
  MessageCircle,
  Phone,
  Mail,
  Users,
  Lightbulb,
  Zap,
  Star,
  ChevronRight,
  ChevronDown,
  Play,
  Download,
  ExternalLink,
  Heart,
  Smile,
  ThumbsUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Headphones,
  Globe,
  Shield
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  tags: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'guide' | 'interactive';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail?: string;
  views: number;
  likes: number;
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  available: boolean;
  responseTime: string;
}

// Mock data
const mockFAQs: FAQ[] = [
  {
    id: 'F001',
    question: '🔐 How do I change my password?',
    answer: 'You can change your password by going to your profile page and clicking on "Change Password". Make sure to use a strong password with letters, numbers, and special characters! 🔒✨',
    category: 'account',
    helpful: 45,
    tags: ['password', 'security', 'account']
  },
  {
    id: 'F002',
    question: '📚 How do I submit my homework?',
    answer: 'Go to the Assignments page, find your homework, and click "Submit". You can upload files or type your answers directly. Don\'t forget to click "Submit" when you\'re done! 🎯📝',
    category: 'assignments',
    helpful: 67,
    tags: ['homework', 'assignments', 'submit']
  },
  {
    id: 'F003',
    question: '🎮 How do I join a class video call?',
    answer: 'When your teacher starts a video call, you\'ll see a notification. Click "Join Call" and make sure your camera and microphone are working. Remember to mute yourself when not speaking! 📹🎤',
    category: 'classes',
    helpful: 34,
    tags: ['video call', 'classes', 'online learning']
  },
  {
    id: 'F004',
    question: '⭐ How do I check my grades?',
    answer: 'Visit the Grades page to see all your scores and feedback. You can also see your progress over time with colorful charts! Keep up the great work! 📊🏆',
    category: 'grades',
    helpful: 52,
    tags: ['grades', 'scores', 'progress']
  },
  {
    id: 'F005',
    question: '🎨 How do I customize my profile?',
    answer: 'Go to your Profile page and click "Edit Profile". You can add a photo, update your information, and choose your favorite colors! Make it uniquely yours! 🌈✨',
    category: 'profile',
    helpful: 29,
    tags: ['profile', 'customization', 'personal']
  }
];

const mockTutorials: Tutorial[] = [
  {
    id: 'T001',
    title: '🚀 Getting Started with Your Dashboard',
    description: 'Learn how to navigate your student dashboard and find everything you need!',
    type: 'video',
    duration: '3 min',
    difficulty: 'beginner',
    category: 'getting-started',
    views: 234,
    likes: 89
  },
  {
    id: 'T002',
    title: '📝 Submitting Assignments Like a Pro',
    description: 'Master the art of submitting homework and projects with this step-by-step guide!',
    type: 'interactive',
    duration: '5 min',
    difficulty: 'beginner',
    category: 'assignments',
    views: 189,
    likes: 76
  },
  {
    id: 'T003',
    title: '🎯 Understanding Your Grades',
    description: 'Learn how to read your grade reports and track your amazing progress!',
    type: 'guide',
    duration: '4 min',
    difficulty: 'intermediate',
    category: 'grades',
    views: 156,
    likes: 64
  },
  {
    id: 'T004',
    title: '👥 Collaborating with Classmates',
    description: 'Discover fun ways to work together on projects and share ideas safely!',
    type: 'video',
    duration: '6 min',
    difficulty: 'intermediate',
    category: 'collaboration',
    views: 123,
    likes: 58
  }
];

const supportOptions: SupportOption[] = [
  {
    id: 'chat',
    title: 'Live Chat Support',
    description: 'Chat with our friendly support team right now!',
    icon: MessageCircle,
    color: 'from-blue-400 to-cyan-400',
    available: true,
    responseTime: '< 2 minutes'
  },
  {
    id: 'email',
    title: 'Email Support',
    description: 'Send us an email and we\'ll get back to you soon!',
    icon: Mail,
    color: 'from-green-400 to-emerald-400',
    available: true,
    responseTime: '< 24 hours'
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: 'Call us during school hours for immediate help!',
    icon: Phone,
    color: 'from-purple-400 to-pink-400',
    available: false,
    responseTime: 'School hours only'
  },
  {
    id: 'teacher',
    title: 'Ask Your Teacher',
    description: 'Your teachers are always ready to help you learn!',
    icon: Users,
    color: 'from-yellow-400 to-orange-400',
    available: true,
    responseTime: 'During class time'
  }
];

const categories = [
  { id: 'all', name: 'All Topics', icon: Globe, count: 15 },
  { id: 'getting-started', name: 'Getting Started', icon: Star, count: 8 },
  { id: 'account', name: 'My Account', icon: Shield, count: 12 },
  { id: 'assignments', name: 'Assignments', icon: BookOpen, count: 9 },
  { id: 'grades', name: 'Grades & Progress', icon: CheckCircle, count: 7 },
  { id: 'classes', name: 'Classes & Learning', icon: Video, count: 11 },
  { id: 'technical', name: 'Technical Help', icon: Zap, count: 6 }
];

const HelpSupport = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("faqs");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredTutorials = mockTutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tutorial.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'interactive': return <Zap className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (!userRole) return null;

  return (
    <DashboardLayout 
      userRole={userRole} 
      userName={userName || "Student"}
      photoUrl={photoUrl}
      onLogout={handleLogout}
    >
      <div className="space-y-4 md:space-y-6 animate-fade-in px-2 md:px-0">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="flex justify-center items-center gap-2">
            <HelpCircle className="h-12 w-12 md:h-16 md:w-16 text-blue-400 animate-pulse" />
            <Lightbulb className="h-8 w-8 md:h-12 md:w-12 text-yellow-400 animate-bounce" />
            <Heart className="h-6 w-6 md:h-10 md:w-10 text-pink-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent animate-scale-in">
            🆘 Help & Support Centre 🆘
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            We're here to help you succeed! Find answers, learn new things, 
            and get the support you need to shine bright! ✨🌟
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatedCard hoverAnimation="bounce" className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-500">{mockFAQs.length}</h3>
              <p className="text-muted-foreground">FAQs</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard hoverAnimation="bounce" delay={100} className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-green-400 to-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-500">{mockTutorials.length}</h3>
              <p className="text-muted-foreground">Tutorials</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard hoverAnimation="bounce" delay={200} className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-500">24/7</h3>
              <p className="text-muted-foreground">Support</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard hoverAnimation="bounce" delay={300} className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-pink-400 to-red-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <ThumbsUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-pink-500">98%</h3>
              <p className="text-muted-foreground">Happy Students</p>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Search Bar */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              How can we help you today? 🔍
            </CardTitle>
            <CardDescription>Search for answers, tutorials, or browse by category</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Ask us anything... What do you need help with? 💭"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <AnimatedCard 
              key={category.id} 
              hoverAnimation="bounce"
              delay={index * 100}
              className={`cursor-pointer transition-all duration-300 ${
                selectedCategory === category.id 
                  ? 'ring-2 ring-primary ring-offset-2 scale-105' 
                  : 'hover:scale-105'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <category.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {category.count} items
                </Badge>
              </CardContent>
            </AnimatedCard>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Help Resources 💡
            </CardTitle>
            <CardDescription>Everything you need to know, learn, and grow!</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b p-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="faqs" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQs
                  </TabsTrigger>
                  <TabsTrigger value="tutorials" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Tutorials
                  </TabsTrigger>
                  <TabsTrigger value="support" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Get Support
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="faqs" className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Frequently Asked Questions 🤔</h3>
                  <p className="text-muted-foreground">Quick answers to common questions!</p>
                </div>

                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No FAQs found</p>
                    <p className="text-sm">Try adjusting your search or category!</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="space-y-2">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <HelpCircle className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-medium">{faq.question}</h4>
                              <div className="flex gap-2 mt-1">
                                {faq.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="ml-11 space-y-3">
                            <p className="text-muted-foreground">{faq.answer}</p>
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Helpful ({faq.helpful})
                                </Button>
                              </div>
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Answered
                              </Badge>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>

              <TabsContent value="tutorials" className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Learning Tutorials 🎬</h3>
                  <p className="text-muted-foreground">Step-by-step guides to help you learn!</p>
                </div>

                {filteredTutorials.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No tutorials found</p>
                    <p className="text-sm">Try adjusting your search or category!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTutorials.map((tutorial, index) => (
                      <AnimatedCard
                        key={tutorial.id}
                        hoverAnimation="float"
                        delay={index * 100}
                        className="cursor-pointer overflow-hidden"
                      >
                        <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-400 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/20 rounded-full p-4">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          </div>
                          <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                            {tutorial.duration}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="bg-gradient-to-r from-green-400 to-blue-400 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                              {getTypeIcon(tutorial.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold line-clamp-2">{tutorial.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {tutorial.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Badge className={getDifficultyColor(tutorial.difficulty)}>
                                {tutorial.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {tutorial.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                {tutorial.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {tutorial.likes}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </AnimatedCard>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="support" className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Get Personal Support 🤝</h3>
                  <p className="text-muted-foreground">Choose the best way to get help from our amazing team!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {supportOptions.map((option, index) => (
                    <AnimatedCard
                      key={option.id}
                      hoverAnimation="bounce"
                      delay={index * 100}
                      className={`cursor-pointer transition-all duration-300 ${
                        option.available ? 'hover:scale-105' : 'opacity-75'
                      }`}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}>
                          <option.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                        <p className="text-muted-foreground mb-4">{option.description}</p>
                        <div className="space-y-2">
                          <Badge variant={option.available ? "default" : "secondary"} className="mb-2">
                            {option.available ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Available Now
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Currently Offline
                              </>
                            )}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            Response time: {option.responseTime}
                          </p>
                          <Button 
                            className={`w-full bg-gradient-to-r ${option.color} text-white`}
                            disabled={!option.available}
                          >
                            {option.available ? 'Get Help Now' : 'Contact Later'}
                          </Button>
                        </div>
                      </CardContent>
                    </AnimatedCard>
                  ))}
                </div>

                {/* Emergency Contact */}
                <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                      Need Urgent Help? 🚨
                    </h3>
                    <p className="text-red-600 dark:text-red-400 mb-4">
                      For urgent technical issues or emergencies, contact your teacher directly or call the school office.
                    </p>
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950">
                      <Phone className="h-4 w-4 mr-2" />
                      Emergency Contact
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Helpful Footer */}
        <Card className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-white overflow-hidden">
          <CardContent className="p-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-pink-600/20" />
            <div className="relative z-10">
              <div className="flex justify-center gap-2 mb-4">
                <Smile className="h-8 w-8 animate-pulse" />
                <Star className="h-8 w-8 animate-bounce" />
                <Heart className="h-8 w-8 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              <h3 className="text-2xl font-bold mb-2">We're Always Here to Help You Succeed! 🌟</h3>
              <p className="text-lg opacity-90">
                Remember, every expert was once a beginner. Don't be afraid to ask questions - 
                that's how we learn and grow together! 🚀💫
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HelpSupport;