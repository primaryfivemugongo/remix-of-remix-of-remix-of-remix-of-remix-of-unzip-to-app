import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Search,
  Filter,
  Eye,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Target
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  stream: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'overdue' | 'graded';
  totalMarks: number;
  submittedCount: number;
  totalStudents: number;
  createdDate: string;
}

// Mock assignments data
const mockAssignments: Assignment[] = [
  {
    id: 'A001',
    title: 'Mathematics Problem Set 1',
    description: 'Basic arithmetic operations and word problems focusing on addition and subtraction',
    subject: 'Mathematics',
    class: 'Primary 1',
    stream: 'PEARLS',
    dueDate: '2024-01-15',
    status: 'pending',
    totalMarks: 50,
    submittedCount: 15,
    totalStudents: 28,
    createdDate: '2024-01-08'
  },
  {
    id: 'A002',
    title: 'English Comprehension Exercise',
    description: 'Reading comprehension passage with questions about main ideas and details',
    subject: 'English',
    class: 'Primary 2',
    stream: 'GOLDEN',
    dueDate: '2024-01-12',
    status: 'submitted',
    totalMarks: 40,
    submittedCount: 27,
    totalStudents: 27,
    createdDate: '2024-01-05'
  },
  {
    id: 'A003',
    title: 'Science Observation Report',
    description: 'Document observations of plant growth over a week-long period',
    subject: 'Science',
    class: 'Primary 3',
    stream: 'CRANES',
    dueDate: '2024-01-10',
    status: 'overdue',
    totalMarks: 30,
    submittedCount: 18,
    totalStudents: 24,
    createdDate: '2024-01-03'
  },
  {
    id: 'A004',
    title: 'Social Studies Project',
    description: 'Research and present about local community helpers and their roles',
    subject: 'Social Studies',
    class: 'Primary 4',
    stream: 'CUBS',
    dueDate: '2024-01-18',
    status: 'graded',
    totalMarks: 60,
    submittedCount: 29,
    totalStudents: 29,
    createdDate: '2024-01-01'
  },
  {
    id: 'A005',
    title: 'Art & Craft Portfolio',
    description: 'Collection of creative works using various materials and techniques',
    subject: 'Art',
    class: 'Primary 5',
    stream: 'SUNSET',
    dueDate: '2024-01-20',
    status: 'pending',
    totalMarks: 45,
    submittedCount: 8,
    totalStudents: 24,
    createdDate: '2024-01-06'
  },
  {
    id: 'A006',
    title: 'History Timeline Assignment',
    description: 'Create a visual timeline of major historical events in Uganda',
    subject: 'History',
    class: 'Primary 6',
    stream: 'RADIANT',
    dueDate: '2024-01-22',
    status: 'pending',
    totalMarks: 55,
    submittedCount: 12,
    totalStudents: 23,
    createdDate: '2024-01-09'
  }
];

const getStatusColor = (status: Assignment['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'submitted':
      return 'bg-blue-500';
    case 'overdue':
      return 'bg-red-500';
    case 'graded':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusIcon = (status: Assignment['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'submitted':
      return <CheckCircle className="h-4 w-4" />;
    case 'overdue':
      return <XCircle className="h-4 w-4" />;
    case 'graded':
      return <Target className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const AssignmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const { userName, photoUrl, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const filteredAssignments = mockAssignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    const matchesSubject = selectedSubject === 'all' || assignment.subject === selectedSubject;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const totalAssignments = mockAssignments.length;
  const pendingAssignments = mockAssignments.filter(a => a.status === 'pending').length;
  const overdueAssignments = mockAssignments.filter(a => a.status === 'overdue').length;
  const subjects = [...new Set(mockAssignments.map(a => a.subject))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSubmissionProgress = (submitted: number, total: number) => {
    return Math.round((submitted / total) * 100);
  };

  return (
    <DashboardLayout
      userRole={userRole}
      userName={userName || ''}
      photoUrl={photoUrl}
      onLogout={handleLogout}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Assignments</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage and track student assignments across all classes
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-in-right">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Across all subjects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting submission
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueAssignments}</div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
              <p className="text-xs text-muted-foreground">
                Active subjects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments, subjects, or classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="animate-fade-in hover-scale">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm">
                      {assignment.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(assignment.status)} text-white border-none`}
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(assignment.status)}
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Assignment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        Subject:
                      </div>
                      <div className="font-medium">{assignment.subject}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Class & Stream:
                      </div>
                      <div className="font-medium">{assignment.class} - {assignment.stream}</div>
                    </div>
                  </div>

                  {/* Due Date & Marks */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due Date:
                      </div>
                      <div className="font-medium">{formatDate(assignment.dueDate)}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Total Marks:
                      </div>
                      <div className="font-medium">{assignment.totalMarks}</div>
                    </div>
                  </div>

                  {/* Submission Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Submission Progress</span>
                      <span className="font-medium">
                        {assignment.submittedCount}/{assignment.totalStudents} 
                        ({getSubmissionProgress(assignment.submittedCount, assignment.totalStudents)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${getSubmissionProgress(assignment.submittedCount, assignment.totalStudents)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 flex-1 w-full sm:w-auto"
                      onClick={() => navigate(`/assignments/${assignment.id}/details`)}
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 flex-1 w-full sm:w-auto"
                      onClick={() => navigate(`/assignments/${assignment.id}/submissions`)}
                    >
                      <Users className="h-3 w-3" />
                      Submissions
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 flex-1 w-full sm:w-auto"
                      onClick={() => navigate(`/assignments/${assignment.id}/grade`)}
                    >
                      <Target className="h-3 w-3" />
                      Grade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAssignments.length === 0 && (
          <Card className="animate-fade-in">
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No assignments found matching your search criteria</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedSubject('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentsPage;