import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnimatedCard } from "@/components/ui/animated-card";
import { useAuth } from "@/hooks/useAuth";
import { 
  BookOpen, 
  FileText,
  ClipboardList,
  FileCheck,
  ArrowLeft,
  GraduationCap,
  Baby,
  Users,
  Sparkles,
  Calculator,
  Languages,
  FlaskConical,
  Globe2,
  Laptop
} from "lucide-react";

interface ClassLevel {
  id: string;
  name: string;
  icon: any;
  gradient: string;
  isSpecial?: boolean;
}

interface ResourceType {
  id: string;
  name: string;
  icon: any;
  gradient: string;
  description: string;
}

interface Subject {
  id: string;
  name: string;
  icon: any;
  color: string;
}

// Class levels
const classLevels: ClassLevel[] = [
  { id: 'baby', name: 'Baby Class', icon: Baby, gradient: 'from-pink-400 to-rose-400', isSpecial: true },
  { id: 'middle', name: 'Middle Class', icon: Users, gradient: 'from-purple-400 to-pink-400', isSpecial: true },
  { id: 'top', name: 'Top Class', icon: Sparkles, gradient: 'from-blue-400 to-purple-400', isSpecial: true },
  { id: 'p1', name: 'Primary One', icon: GraduationCap, gradient: 'from-red-400 to-orange-400' },
  { id: 'p2', name: 'Primary Two', icon: GraduationCap, gradient: 'from-orange-400 to-yellow-400' },
  { id: 'p3', name: 'Primary Three', icon: GraduationCap, gradient: 'from-yellow-400 to-green-400' },
  { id: 'p4', name: 'Primary Four', icon: GraduationCap, gradient: 'from-green-400 to-emerald-400' },
  { id: 'p5', name: 'Primary Five', icon: GraduationCap, gradient: 'from-emerald-400 to-teal-400' },
  { id: 'p6', name: 'Primary Six', icon: GraduationCap, gradient: 'from-teal-400 to-cyan-400' },
  { id: 'p7', name: 'Primary Seven', icon: GraduationCap, gradient: 'from-cyan-400 to-blue-400' },
];

// Resource types
const resourceTypes: ResourceType[] = [
  { 
    id: 'notes', 
    name: 'Lesson Notes', 
    icon: FileText, 
    gradient: 'from-blue-400 to-indigo-400',
    description: 'Comprehensive lesson notes for all subjects'
  },
  { 
    id: 'schemes', 
    name: 'Schemes of Work', 
    icon: ClipboardList, 
    gradient: 'from-purple-400 to-pink-400',
    description: 'Term-by-term teaching schemes'
  },
  { 
    id: 'papers', 
    name: 'Past Papers', 
    icon: FileCheck, 
    gradient: 'from-green-400 to-teal-400',
    description: 'Practice papers and examinations'
  }
];

// Subjects
const subjects: Subject[] = [
  { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'from-blue-500 to-cyan-500' },
  { id: 'english', name: 'English', icon: Languages, color: 'from-purple-500 to-pink-500' },
  { id: 'science', name: 'Science', icon: FlaskConical, color: 'from-green-500 to-emerald-500' },
  { id: 'social', name: 'Social Studies', icon: Globe2, color: 'from-orange-500 to-red-500' },
  { id: 'ict', name: 'ICT', icon: Laptop, color: 'from-indigo-500 to-blue-500' }
];

const Library = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'classes' | 'resources' | 'subjects'>('classes');
  const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);

  const handleClassSelect = (classLevel: ClassLevel) => {
    setSelectedClass(classLevel);
    setCurrentView('resources');
  };

  const handleResourceSelect = (resource: ResourceType) => {
    setSelectedResource(resource);
    if (selectedClass?.isSpecial) {
      console.log(`Navigate to ${selectedClass.id}-${resource.id}`);
    } else {
      setCurrentView('subjects');
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    console.log(`Navigate to ${selectedClass?.id}-${subject.id}-${selectedResource?.id}`);
  };

  const handleBackToClasses = () => {
    setCurrentView('classes');
    setSelectedClass(null);
    setSelectedResource(null);
  };

  const handleBackToResources = () => {
    setCurrentView('resources');
    setSelectedResource(null);
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
      <div className="w-full min-w-0 space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center items-center gap-3">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent px-2">
            📚 School Library
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Kyengera Parents' School - Mugongo
          </p>
        </div>

        {/* Class Selection View */}
        {currentView === 'classes' && (
          <Card>
            <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Select Your Class</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Choose your class level to access learning resources</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {classLevels.map((classLevel, index) => (
                  <AnimatedCard
                    key={classLevel.id}
                    hoverAnimation="bounce"
                    delay={index * 50}
                    className="cursor-pointer group overflow-hidden"
                    onClick={() => handleClassSelect(classLevel)}
                  >
                    <CardContent className="p-3 sm:p-6 text-center space-y-2 sm:space-y-3">
                      <div className={`w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br ${classLevel.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <classLevel.icon className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors break-words">
                        {classLevel.name}
                      </h3>
                    </CardContent>
                  </AnimatedCard>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resource Type Selection View */}
        {currentView === 'resources' && selectedClass && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-2xl truncate">Resources for {selectedClass.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Select the type of resource you need</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleBackToClasses} className="w-full sm:w-auto shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to Classes</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {resourceTypes.map((resource, index) => (
                  <AnimatedCard
                    key={resource.id}
                    hoverAnimation="float"
                    delay={index * 100}
                    className="cursor-pointer group"
                    onClick={() => handleResourceSelect(resource)}
                  >
                    <CardContent className="p-4 sm:p-8 text-center space-y-3 sm:space-y-4">
                      <div className={`w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br ${resource.gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}>
                        <resource.icon className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-base sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors break-words">
                          {resource.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                          {resource.description}
                        </p>
                      </div>
                    </CardContent>
                  </AnimatedCard>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subject Selection View */}
        {currentView === 'subjects' && selectedClass && selectedResource && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-2xl truncate">
                    {selectedClass.name} - {selectedResource.name}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Select a subject to access materials</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleBackToResources} className="w-full sm:w-auto shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to Resources</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {subjects.map((subject, index) => (
                  <AnimatedCard
                    key={subject.id}
                    hoverAnimation="bounce"
                    delay={index * 50}
                    className="cursor-pointer group"
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <CardContent className="p-3 sm:p-6 text-center space-y-2 sm:space-y-3">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <subject.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors break-words leading-tight">
                        {selectedClass.name}<br />{subject.name}
                      </h3>
                    </CardContent>
                  </AnimatedCard>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Library;
