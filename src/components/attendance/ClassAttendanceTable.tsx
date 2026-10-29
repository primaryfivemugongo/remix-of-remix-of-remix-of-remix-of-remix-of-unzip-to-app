import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ResponsiveTable, MobileCardView } from "@/components/admin/ResponsiveTable";

interface ClassData {
  id: string;
  name: string;
  totalStudents: number;
  present: number;
  absent: number;
  attendanceRate: number;
}

interface ClassAttendanceTableProps {
  classData: ClassData[];
  onClassClick: (classId: string) => void;
}

export const ClassAttendanceTable = ({ classData, onClassClick }: ClassAttendanceTableProps) => {
  return (
    <>
      {/* Desktop Table View */}
      <ResponsiveTable title="Class-wise Attendance">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Class/Stream</TableHead>
            <TableHead className="text-center min-w-[120px]">Total Students</TableHead>
            <TableHead className="text-center min-w-[100px]">Present</TableHead>
            <TableHead className="text-center min-w-[100px]">Absent</TableHead>
            <TableHead className="min-w-[200px]">Attendance Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No attendance data available
              </TableCell>
            </TableRow>
          ) : (
            classData.map((classItem) => (
              <TableRow 
                key={classItem.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onClassClick(classItem.id)}
              >
                <TableCell className="font-medium min-w-[150px]">{classItem.name}</TableCell>
                <TableCell className="text-center min-w-[120px]">{classItem.totalStudents}</TableCell>
                <TableCell className="text-center min-w-[100px]">
                  <span className="text-emerald-600 font-semibold">{classItem.present}</span>
                </TableCell>
                <TableCell className="text-center min-w-[100px]">
                  <span className="text-red-600 font-semibold">{classItem.absent}</span>
                </TableCell>
                <TableCell className="min-w-[200px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress value={classItem.attendanceRate} className="h-2" />
                      <span className="text-sm font-medium min-w-[3rem]">
                        {classItem.attendanceRate}%
                      </span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </ResponsiveTable>

      {/* Mobile Card View */}
      <MobileCardView title="Class-wise Attendance" count={classData.length}>
        {classData.length === 0 ? (
          <Card className="w-full">
            <CardContent className="text-center py-8">
              <p className="text-sm text-muted-foreground">No attendance data available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 w-full">
            {classData.map((classItem) => (
              <Card 
                key={classItem.id}
                className="w-full cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onClassClick(classItem.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        <h4 className="font-semibold truncate">{classItem.name}</h4>
                      </div>
                      <span className="text-2xl font-bold shrink-0">
                        {classItem.attendanceRate}%
                      </span>
                    </div>
                    
                    <Progress value={classItem.attendanceRate} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-semibold">{classItem.totalStudents}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Present</p>
                        <p className="text-lg font-semibold text-emerald-600">{classItem.present}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Absent</p>
                        <p className="text-lg font-semibold text-red-600">{classItem.absent}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </MobileCardView>
    </>
  );
};
