import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Clock,
  UserX,
  Archive,
  ArrowRightLeft,
  Plane,
} from "lucide-react";

interface TeacherActionsDropdownProps {
  teacherId: string;
  teacherName: string;
  onSuspend: () => void;
  onTerminate: () => void;
  onArchive: () => void;
  onChangeClass: () => void;
  onLeave: () => void;
}

export function TeacherActionsDropdown({
  teacherId,
  teacherName,
  onSuspend,
  onTerminate,
  onArchive,
  onChangeClass,
  onLeave,
}: TeacherActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background z-50">
        <DropdownMenuItem onClick={onChangeClass} className="cursor-pointer">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Change Class/Stream
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLeave} className="cursor-pointer text-blue-600 focus:text-blue-600">
          <Plane className="mr-2 h-4 w-4" />
          Mark on Leave
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSuspend}
          className="cursor-pointer text-orange-600 focus:text-orange-600"
        >
          <Clock className="mr-2 h-4 w-4" />
          Suspend Teacher
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onArchive}
          className="cursor-pointer text-blue-700 focus:text-blue-700"
        >
          <Archive className="mr-2 h-4 w-4" />
          Archive Teacher
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onTerminate}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <UserX className="mr-2 h-4 w-4" />
          Terminate Teacher
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
