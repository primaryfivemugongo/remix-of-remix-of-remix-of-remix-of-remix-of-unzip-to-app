import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnimatedCard } from "@/components/ui/animated-card";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { useAuth } from "@/hooks/useAuth";
import { 
  Cake, 
  Gift, 
  PartyPopper,
  Calendar,
  Heart,
  Sparkles,
  Star,
  CircleDot,
  Zap,
  Crown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Birthday {
  id: string;
  studentName: string;
  photoUrl?: string;
  dateOfBirth: string;
  class: string;
  age: number;
  favoriteColor?: string;
  favoriteActivity?: string;
  daysUntilBirthday: number;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
}

// Mock birthday data
const mockBirthdays: Birthday[] = [
  {
    id: 'B001',
    studentName: 'Emma Johnson',
    photoUrl: null,
    dateOfBirth: '2025-09-20', // Today for demo
    class: '5A',
    age: 11,
    favoriteColor: 'Pink',
    favoriteActivity: 'Drawing',
    daysUntilBirthday: 0,
    isToday: true,
    isThisWeek: true,
    isThisMonth: true
  },
  {
    id: 'B002',
    studentName: 'Liam Smith',
    photoUrl: null,
    dateOfBirth: '2025-09-22',
    class: '4B',
    age: 10,
    favoriteColor: 'Blue',
    favoriteActivity: 'Soccer',
    daysUntilBirthday: 2,
    isToday: false,
    isThisWeek: true,
    isThisMonth: true
  },
  {
    id: 'B003',
    studentName: 'Olivia Brown',
    photoUrl: null,
    dateOfBirth: '2025-09-25',
    class: '6C',
    age: 12,
    favoriteColor: 'Purple',
    favoriteActivity: 'Reading',
    daysUntilBirthday: 5,
    isToday: false,
    isThisWeek: true,
    isThisMonth: true
  },
  {
    id: 'B004',
    studentName: 'Noah Davis',
    photoUrl: null,
    dateOfBirth: '2025-10-03',
    class: '5B',
    age: 11,
    favoriteColor: 'Green',
    favoriteActivity: 'Basketball',
    daysUntilBirthday: 13,
    isToday: false,
    isThisWeek: false,
    isThisMonth: true
  },
  {
    id: 'B005',
    studentName: 'Ava Wilson',
    photoUrl: null,
    dateOfBirth: '2025-10-12',
    class: '4A',
    age: 10,
    favoriteColor: 'Yellow',
    favoriteActivity: 'Dancing',
    daysUntilBirthday: 22,
    isToday: false,
    isThisWeek: false,
    isThisMonth: true
  },
  {
    id: 'B006',
    studentName: 'Ethan Martinez',
    photoUrl: null,
    dateOfBirth: '2025-11-08',
    class: '3C',
    age: 9,
    favoriteColor: 'Red',
    favoriteActivity: 'Science',
    daysUntilBirthday: 49,
    isToday: false,
    isThisWeek: false,
    isThisMonth: false
  }
];

const Birthdays = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");

  const filteredBirthdays = useMemo(() => {
    return mockBirthdays.filter(birthday => {
      const matchesSearch = birthday.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           birthday.class.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPeriod = (() => {
        switch (filterPeriod) {
          case 'today': return birthday.isToday;
          case 'week': return birthday.isThisWeek;
          case 'month': return birthday.isThisMonth;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesPeriod;
    });
  }, [searchTerm, filterPeriod]);

  const sortedBirthdays = [...filteredBirthdays].sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

  const todaysBirthdays = mockBirthdays.filter(b => b.isToday);
  const thisWeekBirthdays = mockBirthdays.filter(b => b.isThisWeek && !b.isToday);
  const thisMonthBirthdays = mockBirthdays.filter(b => b.isThisMonth && !b.isThisWeek);

  const getBirthdayCardColor = (birthday: Birthday) => {
    if (birthday.isToday) return "bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400";
    if (birthday.isThisWeek) return "bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300";
    if (birthday.isThisMonth) return "bg-gradient-to-r from-blue-300 via-green-300 to-teal-300";
    return "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600";
  };

  const getDaysText = (days: number) => {
    if (days === 0) return "🎉 TODAY! 🎉";
    if (days === 1) return "🎈 Tomorrow 🎈";
    if (days <= 7) return `🎊 In ${days} days 🎊`;
    return `📅 In ${days} days`;
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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2">
            <Cake className="h-16 w-16 text-pink-400 animate-bounce" />
            <PartyPopper className="h-12 w-12 text-yellow-400 animate-pulse" />
            <CircleDot className="h-14 w-14 text-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-blue-600 bg-clip-text text-transparent animate-scale-in">
            🎂 Birthday Celebrations 🎂
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's celebrate all our amazing friends and their special days! 
            Every birthday is a reason to party! 🎉✨
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedCard hoverAnimation="bounce" className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-pink-400 to-red-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-pink-500">{todaysBirthdays.length}</h3>
              <p className="text-muted-foreground">Birthday{todaysBirthdays.length !== 1 ? 's' : ''} Today!</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard hoverAnimation="bounce" delay={100} className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-500">{thisWeekBirthdays.length}</h3>
              <p className="text-muted-foreground">This Week</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard hoverAnimation="bounce" delay={200} className="text-center">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-blue-400 to-green-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-500">{thisMonthBirthdays.length}</h3>
              <p className="text-muted-foreground">This Month</p>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Search and Filters */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30">
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" />
              Find Birthday Stars! 🎈
            </CardTitle>
            <CardDescription>Search for birthdays and filter by time period</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Search by name or class... 🎂"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-base"
                />
              </div>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Birthdays</SelectItem>
                  <SelectItem value="today">🎉 Today</SelectItem>
                  <SelectItem value="week">🎊 This Week</SelectItem>
                  <SelectItem value="month">📅 This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Today's Birthdays Spotlight */}
        {todaysBirthdays.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
              🎊 Today's Birthday Stars! 🎊
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaysBirthdays.map((birthday, index) => (
                <AnimatedCard 
                  key={birthday.id}
                  hoverAnimation="rainbow"
                  delay={index * 200}
                  className="relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <Crown className="h-8 w-8 text-yellow-400 absolute top-2 right-2 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20" />
                  <CardHeader className="text-center pb-2 relative z-10">
                    <div className="flex justify-center mb-4">
                      <PhotoDialog 
                        photoUrl={birthday.photoUrl} 
                        userName={birthday.studentName}
                        size="h-20 w-20"
                      />
                    </div>
                    <CardTitle className="text-xl">{birthday.studentName}</CardTitle>
                    <CardDescription>Turning {birthday.age} today! 🎂</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center relative z-10">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white mb-3">
                      <Gift className="h-4 w-4 mr-1" />
                      Birthday Star!
                    </Badge>
                    <div className="space-y-2 text-sm">
                      <p><strong>Class:</strong> {birthday.class}</p>
                      {birthday.favoriteColor && <p><strong>Favorite Color:</strong> {birthday.favoriteColor}</p>}
                      {birthday.favoriteActivity && <p><strong>Loves:</strong> {birthday.favoriteActivity}</p>}
                    </div>
                  </CardContent>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* All Birthdays */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30">
            <CardTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-primary" />
              All Birthday Celebrations! 🎈
            </CardTitle>
            <CardDescription>
              {sortedBirthdays.length} birthday{sortedBirthdays.length !== 1 ? 's' : ''} to celebrate!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {sortedBirthdays.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CircleDot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No birthdays found</p>
                  <p className="text-sm">Try adjusting your search or filters!</p>
                </div>
              ) : (
                sortedBirthdays.map((birthday, index) => (
                  <AnimatedCard
                    key={birthday.id}
                    hoverAnimation="float"
                    delay={index * 50}
                    className="p-0 overflow-hidden"
                  >
                    <div className={`absolute inset-0 ${getBirthdayCardColor(birthday)} opacity-10`} />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-4 relative z-10">
                      <div className="flex items-center gap-4 flex-1">
                        <PhotoDialog 
                          photoUrl={birthday.photoUrl} 
                          userName={birthday.studentName}
                          size="h-16 w-16"
                        />
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-bold text-lg">{birthday.studentName}</h3>
                            <Badge variant="outline" className="text-xs w-fit">
                              🎓 Class {birthday.class}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {birthday.favoriteColor && (
                              <Badge variant="secondary" className="text-xs">
                                🎨 {birthday.favoriteColor}
                              </Badge>
                            )}
                            {birthday.favoriteActivity && (
                              <Badge variant="secondary" className="text-xs">
                                ❤️ {birthday.favoriteActivity}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Birthday: {new Date(birthday.dateOfBirth).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Badge className={`${getBirthdayCardColor(birthday)} text-white px-4 py-2`}>
                          <Cake className="h-4 w-4 mr-1" />
                          Age {birthday.age}
                        </Badge>
                        <Badge variant={birthday.isToday ? "default" : "secondary"} className="text-sm">
                          {getDaysText(birthday.daysUntilBirthday)}
                        </Badge>
                      </div>
                    </div>
                  </AnimatedCard>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fun Birthday Footer */}
        <Card className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white overflow-hidden">
          <CardContent className="p-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-purple-600/20" />
            <div className="relative z-10">
              <div className="flex justify-center gap-2 mb-4">
                <Zap className="h-8 w-8 animate-pulse" />
                <PartyPopper className="h-8 w-8 animate-bounce" />
                <CircleDot className="h-8 w-8 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Every Day is Special When It's Your Birthday! 🎊</h3>
              <p className="text-lg opacity-90">
                Birthdays are nature's way of telling us to eat more cake and celebrate life! 
                Keep shining, birthday stars! ✨🎂
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Birthdays;