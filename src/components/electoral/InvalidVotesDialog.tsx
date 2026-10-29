import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, MapPin, Clock, User } from "lucide-react";
import { format, parseISO } from "date-fns";

interface InvalidVote {
  id: string;
  voter_id: string;
  voter_name: string;
  voter_email: string;
  voter_class: string;
  voter_stream: string;
  position_title: string;
  candidate_name: string;
  voted_at: string;
  vote_status: string;
  latitude: number | null;
  longitude: number | null;
}

interface InvalidVotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  votes: InvalidVote[];
}

export function InvalidVotesDialog({ open, onOpenChange, votes }: InvalidVotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Invalid Votes ({votes.length})
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Votes marked invalid due to missing location verification
          </p>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="space-y-4 pr-4">
            {votes.map((vote) => (
              <div
                key={vote.id}
                className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50/50 dark:bg-red-950/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{vote.voter_name}</p>
                      <p className="text-sm text-muted-foreground">{vote.voter_email}</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="shrink-0">
                    Invalid
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Class & Stream</p>
                    <p className="font-medium">{vote.voter_class} - {vote.voter_stream}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Position</p>
                    <p className="font-medium">{vote.position_title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Voted For</p>
                    <p className="font-medium">{vote.candidate_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Time
                    </p>
                    <p className="font-medium">
                      {format(parseISO(vote.voted_at), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">
                      {vote.latitude && vote.longitude 
                        ? `Location: ${vote.latitude.toFixed(6)}, ${vote.longitude.toFixed(6)}`
                        : 'Location data missing - Reason for invalid status'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {votes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No invalid votes found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
