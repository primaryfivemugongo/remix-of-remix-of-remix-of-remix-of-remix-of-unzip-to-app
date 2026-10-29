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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const changeClassSchema = z.object({
  class_id: z.string().min(1, "Please select a class"),
  stream_id: z.string().optional(),
});

type ChangeClassFormData = z.infer<typeof changeClassSchema>;

interface ChangeClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  currentClassId?: string;
  currentStreamId?: string;
  onSuccess: () => void;
  classes: { id: string; name: string }[];
  streams: { id: string; name: string; class_id?: string }[];
}

export function ChangeClassModal({
  open,
  onOpenChange,
  studentId,
  studentName,
  currentClassId,
  currentStreamId,
  onSuccess,
  classes,
  streams,
}: ChangeClassModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>(currentClassId || "");

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ChangeClassFormData>({
    resolver: zodResolver(changeClassSchema),
    defaultValues: {
      class_id: currentClassId,
      stream_id: currentStreamId,
    },
  });

  const classId = watch("class_id");

  const filteredStreams = streams.filter(
    (stream) => stream.class_id === classId
  );

  const onSubmit = async (data: ChangeClassFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("students")
        .update({
          class_id: data.class_id,
          stream_id: data.stream_id || null,
        })
        .eq("id", studentId);

      if (error) throw error;

      toast.success(`${studentName}'s class/stream updated successfully`);
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating student class:", error);
      toast.error(error.message || "Failed to update student class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Change Class/Stream
          </DialogTitle>
          <DialogDescription>
            Update {studentName}'s class and stream assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class">
              New Class <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => {
                setValue("class_id", value);
                setSelectedClass(value);
                setValue("stream_id", "");
              }}
              defaultValue={currentClassId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.class_id && (
              <p className="text-sm text-destructive">
                {errors.class_id.message}
              </p>
            )}
          </div>

          {filteredStreams.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="stream">New Stream (Optional)</Label>
              <Select
                onValueChange={(value) => setValue("stream_id", value)}
                defaultValue={currentStreamId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStreams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id}>
                      {stream.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              Update Class/Stream
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
