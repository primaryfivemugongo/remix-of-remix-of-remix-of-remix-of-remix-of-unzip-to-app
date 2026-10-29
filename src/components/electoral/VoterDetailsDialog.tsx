import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Vote {
  id: string;
  voter_id: string;
  voter_name: string;
  voter_email: string;
  voter_class: string;
  voter_stream: string;
  voter_photo?: string;
  position_title: string;
  candidate_name: string;
  voted_at: string;
  vote_status: string;
}

interface VoterDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  votes: Vote[];
  title: string;
  onStudentClick: (vote: Vote) => void;
}

export function VoterDetailsDialog({ 
  open, 
  onOpenChange, 
  votes, 
  title,
  onStudentClick 
}: VoterDetailsDialogProps) {
  // Get unique voters
  const uniqueVoters = Array.from(
    new Map(votes.map(vote => [vote.voter_id, vote])).values()
  );

  const getStatusIcon = (status: string) => {
    const icons = {
      valid: <CheckCircle2 className="h-3 w-3 text-green-600" />,
      verified: <CheckCircle2 className="h-3 w-3 text-blue-600" />,
      invalid: <AlertCircle className="h-3 w-3 text-red-600" />,
      contested: <AlertCircle className="h-3 w-3 text-yellow-600" />
    };
    return icons[status as keyof typeof icons] || icons.valid;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {uniqueVoters.length} {uniqueVoters.length === 1 ? 'voter' : 'voters'}
          </p>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-3">
            {uniqueVoters.map((vote) => (
              <div
                key={vote.voter_id}
                onClick={() => onStudentClick(vote)}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
              >
                <PhotoDialog 
                  photoUrl={vote.voter_photo} 
                  userName={vote.voter_name}
                  size="h-12 w-12"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{vote.voter_name}</h4>
                    {getStatusIcon(vote.vote_status)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{vote.voter_email}</p>
                  <p className="text-xs text-muted-foreground">
                    {vote.voter_class} - {vote.voter_stream}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {votes.filter(v => v.voter_id === vote.voter_id).length} votes
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
