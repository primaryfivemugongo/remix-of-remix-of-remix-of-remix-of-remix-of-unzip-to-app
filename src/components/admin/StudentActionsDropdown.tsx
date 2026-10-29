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
} from "lucide-react";

interface StudentActionsDropdownProps {
  studentId: string;
  studentName: string;
  onSuspend: () => void;
  onExpel: () => void;
  onArchive: () => void;
  onChangeClass: () => void;
}

export function StudentActionsDropdown({
  studentId,
  studentName,
  onSuspend,
  onExpel,
  onArchive,
  onChangeClass,
}: StudentActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background z-50">
        <DropdownMenuItem onClick={onChangeClass} className="cursor-pointer">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Change Class/Stream
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSuspend}
          className="cursor-pointer text-orange-600 focus:text-orange-600"
        >
          <Clock className="mr-2 h-4 w-4" />
          Suspend Student
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onArchive}
          className="cursor-pointer text-blue-600 focus:text-blue-600"
        >
          <Archive className="mr-2 h-4 w-4" />
          Archive Student
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onExpel}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <UserX className="mr-2 h-4 w-4" />
          Expel Student
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
