import { Card, CardContent } from "@/components/ui/card";
import { UserX } from "lucide-react";

export const EmptyAttendanceState = () => {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <UserX className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No students to display yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Please select a class to view its students here.
        </p>
      </CardContent>
    </Card>
  );
};
