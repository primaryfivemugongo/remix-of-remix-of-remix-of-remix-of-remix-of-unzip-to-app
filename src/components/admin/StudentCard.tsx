import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Edit, Phone, MapPin } from "lucide-react";
import { HighlightText } from "@/utils/textHighlighter";

interface Student {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  class_id?: string;
  stream_id?: string;
  is_verified?: boolean;
  created_at?: string;
  default_password?: string;
}

interface StudentCardProps {
  student: Student;
  classNameById: Record<string, string>;
  streamNameById: Record<string, string>;
  searchTerm: string;
}

export function StudentCard({ student, classNameById, streamNameById, searchTerm }: StudentCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 w-full max-w-full overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        {/* Mobile-first compact layout modeled after Teachers page */}
        <div className="space-y-3">
          {/* Header with Avatar and Name */}
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
              <AvatarImage src={student.photo_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs sm:text-sm">
                {student.name?.split(' ').map(n => n[0]).join('') || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm leading-tight mb-1 break-words">
                <HighlightText text={student.name || 'No Name'} searchTerm={searchTerm} />
              </h4>
              <a
                href={`mailto:${student.email}`}
                className="text-xs text-muted-foreground break-all hover:text-primary hover:underline cursor-pointer"
              >
                <HighlightText text={student.email || ''} searchTerm={searchTerm} />
              </a>
            </div>
          </div>

          {/* Status Badge centered */}
          <div className="flex justify-center">
            <Badge variant={student.is_verified ? 'default' : 'secondary'} className="text-xs px-2 py-1">
              {student.is_verified ? '✓ Verified' : '⚠ Unverified'}
            </Badge>
          </div>

          {/* Class and Stream block */}
          {(student.class_id || student.stream_id) && (
            <div className="space-y-2 p-2 bg-muted/30 rounded">
              {student.class_id && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Class:</span>
                  <p className="text-sm font-medium break-words">
                    {classNameById[student.class_id] || student.class_id}
                  </p>
                </div>
              )}
              {student.stream_id && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Stream:</span>
                  <p className="text-sm break-words">
                    {streamNameById[student.stream_id] || student.stream_id}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Join date */}
          <div className="text-xs text-muted-foreground">
            Joined: {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'Unknown'}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a href={`mailto:${student.email}`} className="w-full">
              <Button size="sm" variant="outline" className="h-8 w-full">
                <Mail className="h-3 w-3 mr-1" />
                <span className="sr-only sm:not-sr-only sm:inline">Contact</span>
              </Button>
            </a>
            <Button size="sm" variant="outline" className="h-8 w-full">
              <Edit className="h-3 w-3 mr-1" />
              <span className="sr-only sm:not-sr-only sm:inline">Edit</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}