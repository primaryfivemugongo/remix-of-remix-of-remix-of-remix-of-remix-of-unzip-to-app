import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { 
  Award, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  Filter,
  Search,
  BarChart3,
  Target,
  Trophy,
  Star
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Grade {
  id: string;
  subject: string;
  assessment: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  date: string;
  teacher: string;
  category: 'exam' | 'assignment' | 'project' | 'quiz';
}

interface SubjectSummary {
  subject: string;
  averageScore: number;
  totalAssessments: number;
  grade: string;
  trend: 'up' | 'down' | 'stable';
}

// Mock grades data
const mockGrades: Grade[] = [
  {
    id: 'G001',
    subject: 'Mathematics',
    assessment: 'Mid-Term Exam',
    score: 85,
    maxScore: 100,
    percentage: 85,
    grade: 'A-',
    date: '2024-01-15',
    teacher: 'Mr. Johnson',
    category: 'exam'
  },
  {
    id: 'G002',
    subject: 'English',
    assessment: 'Essay Assignment',
    score: 92,
    maxScore: 100,
    percentage: 92,
    grade: 'A',
    date: '2024-01-12',
    teacher: 'Ms. Smith',
    category: 'assignment'
  },
  {
    id: 'G003',
    subject: 'Science',
    assessment: 'Lab Project',
    score: 78,
    maxScore: 100,
    percentage: 78,
    grade: 'B+',
    date: '2024-01-10',
    teacher: 'Dr. Wilson',
    category: 'project'
  },
  {
    id: 'G004',
    subject: 'History',
    assessment: 'Quiz 1',
    score: 88,
    maxScore: 100,
    percentage: 88,
    grade: 'A-',
    date: '2024-01-08',
    teacher: 'Mrs. Brown',
    category: 'quiz'
  },
  {
    id: 'G005',
    subject: 'Mathematics',
    assessment: 'Homework Set 3',
    score: 95,
    maxScore: 100,
    percentage: 95,
    grade: 'A',
    date: '2024-01-05',
    teacher: 'Mr. Johnson',
    category: 'assignment'
  },
  {
    id: 'G006',
    subject: 'English',
    assessment: 'Reading Quiz',
    score: 82,
    maxScore: 100,
    percentage: 82,
    grade: 'B+',
    date: '2024-01-03',
    teacher: 'Ms. Smith',
    category: 'quiz'
  }
];

const subjectSummaries: SubjectSummary[] = [
  { subject: 'Mathematics', averageScore: 90, totalAssessments: 8, grade: 'A-', trend: 'up' },
  { subject: 'English', averageScore: 87, totalAssessments: 6, grade: 'A-', trend: 'stable' },
  { subject: 'Science', averageScore: 82, totalAssessments: 5, grade: 'B+', trend: 'up' },
  { subject: 'History', averageScore: 85, totalAssessments: 4, grade: 'A-', trend: 'down' },
];

const Grades = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredGrades = mockGrades.filter(grade => {
    const matchesSearch = grade.assessment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || grade.subject === filterSubject;
    const matchesCategory = filterCategory === "all" || grade.category === filterCategory;
    
    return matchesSearch && matchesSubject && matchesCategory;
  });

  const subjects = [...new Set(mockGrades.map(grade => grade.subject))];
  const overallGPA = subjectSummaries.reduce((acc, subject) => acc + subject.averageScore, 0) / subjectSummaries.length;

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (percentage >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    if (percentage >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (percentage >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exam': return <BookOpen className="h-4 w-4" />;
      case 'assignment': return <Target className="h-4 w-4" />;
      case 'project': return <Trophy className="h-4 w-4" />;
      case 'quiz': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
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
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-elegant bg-clip-text text-transparent">
              My Grades
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your academic performance and progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              GPA: {overallGPA.toFixed(2)}/100
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {subjectSummaries.map((subject) => (
            <Card key={subject.subject} className="hover-scale">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {subject.subject}
                  </CardTitle>
                  {getTrendIcon(subject.trend)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{subject.averageScore}%</span>
                    <Badge variant="secondary" className={getGradeColor(subject.averageScore)}>
                      {subject.grade}
                    </Badge>
                  </div>
                  <Progress value={subject.averageScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {subject.totalAssessments} assessments
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search assessments or subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="exam">Exams</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="quiz">Quizzes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grades List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Grades
            </CardTitle>
            <CardDescription>
              Your latest assessment results and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredGrades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No grades found matching your criteria</p>
                </div>
              ) : (
                filteredGrades.map((grade) => (
                  <div 
                    key={grade.id} 
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getCategoryIcon(grade.category)}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-semibold">{grade.assessment}</h3>
                          <Badge variant="outline" className="text-xs w-fit">
                            {grade.subject}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Teacher: {grade.teacher}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(grade.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 sm:mt-0">
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {grade.score}/{grade.maxScore}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {grade.percentage}%
                        </div>
                      </div>
                      <Badge className={getGradeColor(grade.percentage)}>
                        {grade.grade}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Grades;