import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnimatedCard } from "@/components/ui/animated-card";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { useAuth } from "@/hooks/useAuth";
import { 
  Trophy, 
  Star, 
  Medal, 
  Crown,
  Award,
  Sparkles,
  Zap,
  Target,
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Heart,
  Rocket,
  Gift,
  Cake,
  PartyPopper
} from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Achievement {
  id: string;
  studentName: string;
  photoUrl?: string;
  category: 'academic' | 'sports' | 'arts' | 'leadership' | 'community' | 'attendance';
  achievement: string;
  description: string;
  points: number;
  date: string;
  level: 'gold' | 'silver' | 'bronze' | 'platinum';
  subject?: string;
}

// Mock achievements data
const mockAchievements: Achievement[] = [
  {
    id: 'A001',
    studentName: 'Emma Johnson',
    photoUrl: null,
    category: 'academic',
    achievement: 'Math Champion 2024',
    description: 'Perfect scores in all math assessments',
    points: 100,
    date: '2024-01-20',
    level: 'platinum',
    subject: 'Mathematics'
  },
  {
    id: 'A002',
    studentName: 'Liam Smith',
    photoUrl: null,
    category: 'sports',
    achievement: 'Soccer MVP',
    description: 'Led team to regional championship',
    points: 95,
    date: '2024-01-18',
    level: 'gold'
  },
  {
    id: 'A003',
    studentName: 'Olivia Brown',
    photoUrl: null,
    category: 'arts',
    achievement: 'Art Exhibition Winner',
    description: 'First place in school art competition',
    points: 85,
    date: '2024-01-15',
    level: 'gold'
  },
  {
    id: 'A004',
    studentName: 'Noah Davis',
    photoUrl: null,
    category: 'leadership',
    achievement: 'Student Council President',
    description: 'Leading with excellence and innovation',
    points: 90,
    date: '2024-01-12',
    level: 'gold'
  },
  {
    id: 'A005',
    studentName: 'Ava Wilson',
    photoUrl: null,
    category: 'community',
    achievement: 'Community Service Star',
    description: '200+ hours of community service',
    points: 80,
    date: '2024-01-10',
    level: 'silver'
  },
  {
    id: 'A006',
    studentName: 'Ethan Martinez',
    photoUrl: null,
    category: 'attendance',
    achievement: 'Perfect Attendance',
    description: 'Never missed a single day this year',
    points: 75,
    date: '2024-01-08',
    level: 'silver'
  },
  {
    id: 'A007',
    studentName: 'Sophia Garcia',
    photoUrl: null,
    category: 'academic',
    achievement: 'Science Fair Champion',
    description: 'Revolutionary project on renewable energy',
    points: 98,
    date: '2024-01-05',
    level: 'platinum',
    subject: 'Science'
  },
  {
    id: 'A008',
    studentName: 'Mason Rodriguez',
    photoUrl: null,
    category: 'sports',
    achievement: 'Basketball All-Star',
    description: 'Top scorer in inter-school tournament',
    points: 88,
    date: '2024-01-03',
    level: 'gold'
  }
];

const categories = [
  { id: 'all', name: 'All Categories', icon: Trophy, color: 'from-purple-400 to-pink-400', route: null },
  { id: 'academic', name: 'Academic Excellence', icon: BookOpen, color: 'from-blue-400 to-cyan-400', route: null },
  { id: 'sports', name: 'Sports & Athletics', icon: Medal, color: 'from-green-400 to-emerald-400', route: null },
  { id: 'arts', name: 'Arts & Creativity', icon: Sparkles, color: 'from-pink-400 to-rose-400', route: null },
  { id: 'leadership', name: 'Leadership', icon: Crown, color: 'from-yellow-400 to-orange-400', route: null },
  { id: 'community', name: 'Community Service', icon: Heart, color: 'from-teal-400 to-green-400', route: null },
  { id: 'attendance', name: 'Attendance', icon: Calendar, color: 'from-indigo-400 to-purple-400', route: null },
  { id: 'birthdays', name: 'Birthday Celebrations', icon: Cake, color: 'from-pink-500 to-purple-500', route: '/birthdays' }
];

const HallOfFame = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const filteredAchievements = mockAchievements.filter(achievement => {
    const matchesSearch = achievement.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.achievement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || achievement.category === filterCategory;
    const matchesLevel = filterLevel === "all" || achievement.level === filterLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const sortedAchievements = [...filteredAchievements].sort((a, b) => b.points - a.points);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platinum': return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case 'gold': return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white";
      case 'silver': return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case 'bronze': return "bg-gradient-to-r from-amber-600 to-yellow-600 text-white";
      default: return "bg-gradient-to-r from-blue-400 to-purple-400 text-white";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'platinum': return <Rocket className="h-4 w-4" />;
      case 'gold': return <Crown className="h-4 w-4" />;
      case 'silver': return <Star className="h-4 w-4" />;
      case 'bronze': return <Medal className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? <cat.icon className="h-5 w-5" /> : <Trophy className="h-5 w-5" />;
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
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="h-12 w-12 md:h-16 md:w-16 text-yellow-400 animate-bounce" />
              <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-pink-400 absolute -top-1 -right-1 md:-top-2 md:-right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-scale-in">
            🌟 Hall of Fame 🌟
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Celebrating our amazing students and their incredible achievements! 
            Every star here has worked hard to shine bright! ✨
          </p>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {categories.map((category, index) => {
            const count = category.id === 'all' 
              ? mockAchievements.length 
              : category.id === 'birthdays'
              ? 12 // Mock birthday count
              : mockAchievements.filter(a => a.category === category.id).length;
            
            const handleClick = () => {
              if (category.route) {
                navigate(category.route);
              } else {
                setFilterCategory(category.id);
              }
            };
            
            return (
              <AnimatedCard 
                key={category.id} 
                hoverAnimation="bounce"
                delay={index * 100}
                className={`cursor-pointer transition-all duration-300 ${
                  filterCategory === category.id && !category.route
                    ? 'ring-2 ring-primary ring-offset-2 scale-105' 
                    : 'hover:scale-105'
                } ${category.route ? 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-1' : ''}`}
                onClick={handleClick}
              >
                <CardContent className="p-4 text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center mb-3 ${
                    category.id === 'birthdays' ? 'animate-pulse' : ''
                  }`}>
                    <category.icon className={`h-6 w-6 text-white ${category.id === 'birthdays' ? 'animate-bounce' : ''}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.id === 'birthdays' ? `${count} celebrations` : `${count} ${count === 1 ? 'star' : 'stars'}`}
                  </Badge>
                  {category.route && (
                    <div className="mt-2">
                      <PartyPopper className="h-3 w-3 text-pink-400 mx-auto animate-pulse" />
                    </div>
                  )}
                </CardContent>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Find Your Stars! 🔍
            </CardTitle>
            <CardDescription>Search for amazing achievements and filter by category or level</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <Input 
                  placeholder="Search by student name or achievement... ✨"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="platinum">🚀 Platinum</SelectItem>
                    <SelectItem value="gold">👑 Gold</SelectItem>
                    <SelectItem value="silver">⭐ Silver</SelectItem>
                    <SelectItem value="bronze">🥉 Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Spotlight */}
        {sortedAchievements.length >= 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center gradient-text">
              🎊 Top 3 Superstars 🎊
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sortedAchievements.slice(0, 3).map((achievement, index) => (
                <AnimatedCard 
                  key={achievement.id}
                  hoverAnimation="rainbow"
                  delay={index * 200}
                  className="relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-yellow-400' : 
                      index === 1 ? 'bg-gray-300' : 'bg-amber-600'
                    } flex items-center justify-center text-white font-bold text-sm`}>
                      {index + 1}
                    </div>
                  </div>
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                      <PhotoDialog 
                        photoUrl={achievement.photoUrl} 
                        userName={achievement.studentName}
                        size="h-16 w-16"
                      />
                    </div>
                    <CardTitle className="text-lg">{achievement.studentName}</CardTitle>
                    <CardDescription className="text-sm">{achievement.achievement}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge className={`${getLevelColor(achievement.level)} mb-2`}>
                      {getLevelIcon(achievement.level)}
                      <span className="ml-1 capitalize">{achievement.level}</span>
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex justify-center items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-lg">{achievement.points} pts</span>
                    </div>
                  </CardContent>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* All Achievements */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Our Amazing Stars! ⭐
            </CardTitle>
            <CardDescription>
              {sortedAchievements.length} incredible achievements to celebrate!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {sortedAchievements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Gift className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No achievements found</p>
                  <p className="text-sm">Try adjusting your search or filters!</p>
                </div>
              ) : (
                sortedAchievements.map((achievement, index) => (
                  <AnimatedCard
                    key={achievement.id}
                    hoverAnimation="float"
                    delay={index * 50}
                    className="p-0 overflow-hidden"
                  >
                    <div className="flex flex-col gap-4 p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <PhotoDialog 
                            photoUrl={achievement.photoUrl} 
                            userName={achievement.studentName}
                            size="h-12 w-12"
                          />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-col gap-2">
                            <h3 className="font-bold text-lg truncate">{achievement.studentName}</h3>
                            <Badge variant="outline" className="text-xs w-fit">
                              {getCategoryIcon(achievement.category)}
                              <span className="ml-1 capitalize">{achievement.category}</span>
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-primary line-clamp-2">{achievement.achievement}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>
                          {achievement.subject && (
                            <Badge variant="secondary" className="text-xs w-fit">
                              📚 {achievement.subject}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="font-bold text-lg">{achievement.points}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                        <Badge className={`${getLevelColor(achievement.level)} px-3 py-1`}>
                          {getLevelIcon(achievement.level)}
                          <span className="ml-1 capitalize">{achievement.level}</span>
                        </Badge>
                      </div>
                    </div>
                  </AnimatedCard>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Footer */}
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white overflow-hidden">
          <CardContent className="p-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
            <div className="relative z-10">
              <Sparkles className="h-12 w-12 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Keep Shining, Amazing Stars! ✨</h3>
              <p className="text-lg opacity-90">
                Every great achievement started with someone who decided to try. 
                Your turn could be next! 🌟
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HallOfFame;