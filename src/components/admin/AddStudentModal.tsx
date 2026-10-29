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
import { generateSecurePassword } from "@/utils/emailGenerator";
import { hash } from "bcryptjs";

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  class_id: z.string().min(1, "Please select a class"),
  stream_id: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal("")),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  classes: { id: string; name: string }[];
  streams: { id: string; name: string; class_id?: string }[];
}

export function AddStudentModal({
  open,
  onOpenChange,
  onSuccess,
  classes,
  streams,
}: AddStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const classId = watch("class_id");

  const filteredStreams = streams.filter(
    (stream) => stream.class_id === classId
  );

  const onSubmit = async (data: StudentFormData) => {
    setLoading(true);
    try {
      // Generate a 4-digit password with leading zeros (0001-9999)
      const randomNum = Math.floor(Math.random() * 10000);
      const defaultPassword = randomNum.toString().padStart(4, '0');
      const studentId = crypto.randomUUID();
      const passwordHash = await hash(defaultPassword, 10);

      const { error } = await supabase.from("students").insert([
        {
          id: studentId,
          name: data.name,
          email: data.email,
          class_id: data.class_id,
          stream_id: data.stream_id || null,
          photo_url: data.photo_url || null,
          password_hash: passwordHash,
          is_verified: false,
        },
      ]);

      if (error) throw error;

      toast.success(`Student admitted successfully! Default password: ${defaultPassword}`);
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast.error(error.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Admit New Student
          </DialogTitle>
          <DialogDescription>
            Add a new student to the school system. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="student@school.com"
              {...register("email")}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">
              Class <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => {
                setValue("class_id", value);
                setSelectedClass(value);
                setValue("stream_id", "");
              }}
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
              <Label htmlFor="stream">Stream (Optional)</Label>
              <Select
                onValueChange={(value) => setValue("stream_id", value)}
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

          <div className="space-y-2">
            <Label htmlFor="photo_url">Photo URL (Optional)</Label>
            <Input
              id="photo_url"
              type="url"
              placeholder="https://example.com/photo.jpg"
              {...register("photo_url")}
              disabled={loading}
            />
            {errors.photo_url && (
              <p className="text-sm text-destructive">
                {errors.photo_url.message}
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
              Admit Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
