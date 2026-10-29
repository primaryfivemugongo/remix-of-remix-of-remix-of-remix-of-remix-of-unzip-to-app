import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, BookOpen, Users, Clock, Calendar, Edit, Trash2, Eye } from "lucide-react";
import { ResponsiveTable, MobileCardView } from "@/components/admin/ResponsiveTable";
import { CourseCard } from "@/components/admin/CourseCard";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const coursesData = [
  {
    id: 1,
    code: "MATH101",
    name: "Introduction to Mathematics",
    instructor: "Dr. Sarah Wilson",
    students: 32,
    schedule: "Mon, Wed, Fri 9:00 AM",
    duration: "3 hours/week",
    semester: "Spring 2024",
    status: "active",
    category: "Mathematics"
  },
  {
    id: 2,
    code: "ENG201",
    name: "Advanced English Literature",
    instructor: "Prof. Michael Johnson",
    students: 28,
    schedule: "Tue, Thu 2:00 PM",
    duration: "4 hours/week",
    semester: "Spring 2024",
    status: "active",
    category: "English"
  },
  {
    id: 3,
    code: "SCI301",
    name: "Physics Laboratory",
    instructor: "Dr. Emily Chen",
    students: 24,
    schedule: "Wed 1:00 PM - 4:00 PM",
    duration: "3 hours/week",
    semester: "Spring 2024",
    status: "active",
    category: "Science"
  },
  {
    id: 4,
    code: "HIST102",
    name: "World History",
    instructor: "Prof. David Brown",
    students: 35,
    schedule: "Mon, Thu 11:00 AM",
    duration: "3 hours/week",
    semester: "Spring 2024",
    status: "active",
    category: "History"
  },
  {
    id: 5,
    code: "ART201",
    name: "Digital Art Design",
    instructor: "Ms. Lisa Garcia",
    students: 20,
    schedule: "Tue, Fri 10:00 AM",
    duration: "4 hours/week",
    semester: "Spring 2024",
    status: "pending",
    category: "Arts"
  },
  {
    id: 6,
    code: "CS101",
    name: "Computer Programming Basics",
    instructor: "Prof. Alex Kim",
    students: 40,
    schedule: "Mon, Wed 3:00 PM",
    duration: "5 hours/week",
    semester: "Spring 2024",
    status: "active",
    category: "Technology"
  }
];

const categories = ["All", "Mathematics", "English", "Science", "History", "Arts", "Technology"];

export default function AdminCourses() {
  const { userRole, userName, photoUrl, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const totalStudents = coursesData.reduce((sum, course) => sum + course.students, 0);
  const activeCourses = coursesData.filter(course => course.status === 'active').length;
  const totalInstructors = [...new Set(coursesData.map(course => course.instructor))].length;

  return (
    <DashboardLayout userRole={userRole || "admin"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
            <p className="text-muted-foreground">Manage courses, schedules, and curriculum</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Course
          </Button>
        </div>

        {/* Course Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coursesData.length}</div>
              <p className="text-xs text-muted-foreground">{activeCourses} currently active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Instructors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInstructors}</div>
              <p className="text-xs text-muted-foreground">Teaching this semester</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Class Size</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalStudents / coursesData.length)}</div>
              <p className="text-xs text-muted-foreground">Students per course</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search courses..." className="pl-10" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select defaultValue="All">
                  <SelectTrigger className="w-full sm:flex-1">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses List - Desktop View */}
        <ResponsiveTable title="All Courses">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Course</TableHead>
              <TableHead className="w-[20%]">Instructor</TableHead>
              <TableHead className="w-[10%]">Students</TableHead>
              <TableHead className="hidden xl:table-cell w-[20%]">Schedule</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[15%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coursesData.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-md bg-muted flex-shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{course.code}: {course.name}</p>
                      <Badge variant="outline" className="mt-1">{course.category}</Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="truncate">{course.instructor}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 flex-shrink-0" />
                    <span className="text-sm">{course.students}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{course.schedule}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ResponsiveTable>

        {/* Courses Cards - Mobile View */}
        <MobileCardView title="All Courses" count={coursesData.length}>
          {coursesData.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              getStatusColor={getStatusColor} 
            />
          ))}
        </MobileCardView>
      </div>
    </DashboardLayout>
  );
}