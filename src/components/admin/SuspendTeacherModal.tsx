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

const suspendSchema = z.object({
  suspension_start: z.string().min(1, "Start date is required"),
  suspension_end: z.string().min(1, "End date is required"),
  suspension_reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type SuspendFormData = z.infer<typeof suspendSchema>;

interface SuspendTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  teacherName: string;
  onSuccess: () => void;
}

export function SuspendTeacherModal({
  open,
  onOpenChange,
  teacherId,
  teacherName,
  onSuccess,
}: SuspendTeacherModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SuspendFormData>({
    resolver: zodResolver(suspendSchema),
  });

  const onSubmit = async (data: SuspendFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("teachers")
        .update({
          is_verified: false, // Mark as unverified during suspension
        })
        .eq("id", teacherId);

      if (error) throw error;

      toast.success(`${teacherName} has been suspended`);
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error suspending teacher:", error);
      toast.error(error.message || "Failed to suspend teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-orange-600">
            Suspend Teacher
          </DialogTitle>
          <DialogDescription>
            Suspend {teacherName} from work for a specific period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suspension_start">
              Suspension Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="suspension_start"
              type="date"
              {...register("suspension_start")}
              disabled={loading}
            />
            {errors.suspension_start && (
              <p className="text-sm text-destructive">
                {errors.suspension_start.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="suspension_end">
              Suspension End Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="suspension_end"
              type="date"
              {...register("suspension_end")}
              disabled={loading}
            />
            {errors.suspension_end && (
              <p className="text-sm text-destructive">
                {errors.suspension_end.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="suspension_reason">
              Reason for Suspension <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="suspension_reason"
              placeholder="Enter the reason for suspension..."
              rows={4}
              {...register("suspension_reason")}
              disabled={loading}
            />
            {errors.suspension_reason && (
              <p className="text-sm text-destructive">
                {errors.suspension_reason.message}
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
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suspend Teacher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
