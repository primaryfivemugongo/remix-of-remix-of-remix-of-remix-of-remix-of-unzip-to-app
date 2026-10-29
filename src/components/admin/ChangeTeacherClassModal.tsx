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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const changeClassSchema = z.object({
  classesTaught: z.string().min(1, "Please enter classes taught"),
  subjectsTaught: z.string().min(1, "Please enter subjects taught"),
});

type ChangeClassFormData = z.infer<typeof changeClassSchema>;

interface ChangeTeacherClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  teacherName: string;
  currentClasses?: string;
  currentSubjects?: string;
  onSuccess: () => void;
}

export function ChangeTeacherClassModal({
  open,
  onOpenChange,
  teacherId,
  teacherName,
  currentClasses,
  currentSubjects,
  onSuccess,
}: ChangeTeacherClassModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangeClassFormData>({
    resolver: zodResolver(changeClassSchema),
    defaultValues: {
      classesTaught: currentClasses,
      subjectsTaught: currentSubjects,
    },
  });

  const onSubmit = async (data: ChangeClassFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("teachers")
        .update({
          classesTaught: data.classesTaught,
          subjectsTaught: data.subjectsTaught,
        })
        .eq("id", teacherId);

      if (error) throw error;

      toast.success(`${teacherName}'s classes/subjects updated successfully`);
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating teacher assignment:", error);
      toast.error(error.message || "Failed to update teacher assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Change Teacher Assignment
          </DialogTitle>
          <DialogDescription>
            Update {teacherName}'s class and subject assignments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="classesTaught">
              Classes Taught <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="classesTaught"
              placeholder="Grade 10A, Grade 11B, Grade 12C"
              rows={3}
              {...register("classesTaught")}
              disabled={loading}
            />
            {errors.classesTaught && (
              <p className="text-sm text-destructive">
                {errors.classesTaught.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectsTaught">
              Subjects Taught <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="subjectsTaught"
              placeholder="Mathematics, Physics, Chemistry"
              rows={3}
              {...register("subjectsTaught")}
              disabled={loading}
            />
            {errors.subjectsTaught && (
              <p className="text-sm text-destructive">
                {errors.subjectsTaught.message}
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
