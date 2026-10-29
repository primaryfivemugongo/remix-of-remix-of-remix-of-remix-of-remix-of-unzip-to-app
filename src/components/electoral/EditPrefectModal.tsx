import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { updateManualApplication } from "@/utils/electoralStorageUtils";

interface ElectoralApplication {
  id: string;
  student_name: string;
  student_email: string;
  position: string;
  class_name: string;
  stream_name: string;
  sex?: string;
  age?: number;
  class_teacher_name?: string;
  class_teacher_tel?: string;
  parent_name?: string;
  parent_tel?: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

interface EditPrefectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: ElectoralApplication | null;
  onSuccess: () => void;
}

const positions = [
  { value: 'head_prefect', label: 'Head Prefect' },
  { value: 'academic_prefect', label: 'Academic Prefect' },
  { value: 'head_monitors', label: 'Head Monitor(es)' },
  { value: 'welfare_prefect', label: 'Welfare Prefect (Mess Prefect)' },
  { value: 'entertainment_prefect', label: 'Entertainment Prefect' },
  { value: 'games_sports_prefect', label: 'Games and Sports Prefect' },
  { value: 'health_sanitation', label: 'Health & Sanitation' },
  { value: 'uniform_uniformity', label: 'Uniform & Uniformity' },
  { value: 'time_keeper', label: 'Time Keeper' },
  { value: 'ict_prefect', label: 'ICT Prefect' },
  { value: 'furniture_prefect', label: 'Furniture Prefect(s)' },
  { value: 'prefect_upper_section', label: 'Prefect for Upper Section' },
  { value: 'prefect_lower_section', label: 'Prefect for Lower Section' },
  { value: 'discipline_prefect', label: 'Prefect in Charge of Discipline' }
];

export default function EditPrefectModal({ open, onOpenChange, application, onSuccess }: EditPrefectModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    position: "",
    class_teacher_tel: "",
    parent_tel: "",
    status: "pending"
  });

  useEffect(() => {
    if (application) {
      setFormData({
        position: application.position,
        class_teacher_tel: application.class_teacher_tel || "",
        parent_tel: application.parent_tel?.toString() || "",
        status: application.status
      });
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    setLoading(true);

    try {
      // Check if it's a local application
      if (application.id.startsWith('manual_')) {
        updateManualApplication(application.id, {
          position: formData.position,
          class_teacher_tel: formData.class_teacher_tel || null,
          parent_tel: formData.parent_tel || null,
          status: formData.status as 'pending' | 'confirmed' | 'rejected'
        });
      } else {
        // Database application
        const { error } = await supabase
          .from('electoral_applications')
          .update({
            position: formData.position,
            class_teacher_tel: formData.class_teacher_tel || null,
            parent_tel: formData.parent_tel || null,
            status: formData.status
          })
          .eq('id', application.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Application updated successfully."
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
          <DialogDescription>
            Edit editable fields only. Database-fetched fields like student name and email cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only fields */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Read-Only Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Student Name:</span> {application.student_name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {application.student_email}
              </div>
              <div>
                <span className="font-medium">Class:</span> {application.class_name}
              </div>
              <div>
                <span className="font-medium">Stream:</span> {application.stream_name}
              </div>
              {application.sex && (
                <div>
                  <span className="font-medium">Sex:</span> {application.sex}
                </div>
              )}
              {application.age && (
                <div>
                  <span className="font-medium">Age:</span> {application.age}
                </div>
              )}
              {application.class_teacher_name && (
                <div>
                  <span className="font-medium">Class Teacher:</span> {application.class_teacher_name}
                </div>
              )}
              {application.parent_name && (
                <div>
                  <span className="font-medium">Parent Name:</span> {application.parent_name}
                </div>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_teacher_tel">Class Teacher Tel</Label>
                <Input
                  id="class_teacher_tel"
                  value={formData.class_teacher_tel}
                  onChange={(e) => setFormData({ ...formData, class_teacher_tel: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_tel">Parent Tel</Label>
                <Input
                  id="parent_tel"
                  value={formData.parent_tel}
                  onChange={(e) => setFormData({ ...formData, parent_tel: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
