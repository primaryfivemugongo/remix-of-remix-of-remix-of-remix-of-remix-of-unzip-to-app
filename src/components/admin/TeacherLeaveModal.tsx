import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const leaveSchema = z.object({
  leave_start: z.string().min(1, "Start date is required"),
  leave_end: z.string().min(1, "End date is required"),
  leave_reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface TeacherLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  teacherName: string;
  onSuccess: () => void;
}

export function TeacherLeaveModal({
  open,
  onOpenChange,
  teacherId,
  teacherName,
  onSuccess,
}: TeacherLeaveModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  });

  const onSubmit = async (data: LeaveFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("teachers")
        .update({
          is_verified: false, // Mark as unverified during leave
        })
        .eq("id", teacherId);

      if (error) throw error;

      toast.success(`${teacherName} marked as on leave`);
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error marking teacher on leave:", error);
      toast.error(error.message || "Failed to mark teacher on leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-600">
            Mark Teacher on Leave
          </DialogTitle>
          <DialogDescription>
            Mark {teacherName} as on leave for a specific period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leave_start">
              Leave Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leave_start"
              type="date"
              {...register("leave_start")}
              disabled={loading}
            />
            {errors.leave_start && (
              <p className="text-sm text-destructive">
                {errors.leave_start.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave_end">
              Leave End Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="leave_end"
              type="date"
              {...register("leave_end")}
              disabled={loading}
            />
            {errors.leave_end && (
              <p className="text-sm text-destructive">
                {errors.leave_end.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave_reason">
              Reason for Leave <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="leave_reason"
              placeholder="E.g., Medical leave, Personal reasons, etc."
              rows={4}
              {...register("leave_reason")}
              disabled={loading}
            />
            {errors.leave_reason && (
              <p className="text-sm text-destructive">
                {errors.leave_reason.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark on Leave
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
