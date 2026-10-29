import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, Calendar, Eye, Edit } from "lucide-react";

interface Course {
  id: number;
  code: string;
  name: string;
  instructor: string;
  students: number;
  schedule: string;
  duration: string;
  semester: string;
  status: string;
  category: string;
}

interface CourseCardProps {
  course: Course;
  getStatusColor: (status: string) => string;
}

export function CourseCard({ course, getStatusColor }: CourseCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-muted shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-foreground">
                  <span className="block sm:inline">{course.code}:</span>
                  <span className="block sm:inline sm:ml-1">{course.name}</span>
                </h4>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  Instructor: {course.instructor}
                </p>
              </div>
              <Badge className={`${getStatusColor(course.status)} shrink-0`}>
                {course.status}
              </Badge>
            </div>
            
            {/* Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {course.category}
                </Badge>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.students} students
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="truncate">{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span className="truncate">{course.schedule}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}