import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PhysicalVotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  candidateName: string;
  position: string;
  onSuccess: () => void;
}

export function PhysicalVotesModal({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  position,
  onSuccess
}: PhysicalVotesModalProps) {
  const { toast } = useToast();
  const [votes, setVotes] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const votesCount = parseInt(votes);
    
    if (isNaN(votesCount) || votesCount < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of votes",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('physical_votes')
        .insert({
          candidate_id: candidateId,
          candidate_name: candidateName,
          position: position,
          votes_count: votesCount,
          notes: notes || null,
          added_at: new Date().toISOString()
        });
      
      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${votesCount} physical votes for ${candidateName}`
      });

      setVotes("");
      setNotes("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding physical votes:', error);
      toast({
        title: "Error",
        description: "Failed to add physical votes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Physical Votes</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Candidate</Label>
            <Input value={candidateName} disabled />
          </div>
          <div>
            <Label>Position</Label>
            <Input value={position} disabled />
          </div>
          <div>
            <Label htmlFor="votes">Number of Votes</Label>
            <Input
              id="votes"
              type="number"
              min="0"
              value={votes}
              onChange={(e) => setVotes(e.target.value)}
              placeholder="Enter number of physical votes"
              required
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Votes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
