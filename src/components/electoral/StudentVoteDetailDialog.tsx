import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertCircle, Clock, Vote, User } from "lucide-react";

interface Vote {
  id: string;
  voter_id: string;
  voter_name: string;
  voter_email: string;
  voter_class: string;
  voter_stream: string;
  voter_photo?: string;
  position_id: string;
  position_title: string;
  candidate_id: string;
  candidate_name: string;
  voted_at: string;
  vote_status: string;
  ip_address?: string;
}

interface StudentVoteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  votes: Vote[];
  studentName: string;
}

export function StudentVoteDetailDialog({ 
  open, 
  onOpenChange, 
  votes,
  studentName 
}: StudentVoteDetailDialogProps) {
  if (votes.length === 0) return null;

  const studentInfo = votes[0];

  const getStatusBadge = (status: string) => {
    const configs = {
      valid: { color: 'bg-green-500', icon: CheckCircle2, label: 'Valid' },
      invalid: { color: 'bg-red-500', icon: AlertCircle, label: 'Invalid' },
      verified: { color: 'bg-blue-500', icon: CheckCircle2, label: 'Verified' },
      contested: { color: 'bg-yellow-500', icon: AlertCircle, label: 'Contested' }
    };
    
    const config = configs[status as keyof typeof configs] || configs.valid;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Vote Details - {studentName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Student Info Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <PhotoDialog 
                    photoUrl={studentInfo.voter_photo} 
                    userName={studentInfo.voter_name}
                    size="h-20 w-20"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{studentInfo.voter_name}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">{studentInfo.voter_email}</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{studentInfo.voter_class} - {studentInfo.voter_stream}</span>
                      </div>
                      {studentInfo.ip_address && (
                        <p className="text-xs text-muted-foreground">IP: {studentInfo.ip_address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Votes Cast */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Vote className="h-5 w-5" />
                Votes Cast ({votes.length})
              </h4>
              <div className="space-y-3">
                {votes.map((vote) => (
                  <Card key={vote.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-primary mb-1">{vote.position_title}</p>
                          <p className="text-sm">Voted for: <span className="font-medium">{vote.candidate_name}</span></p>
                        </div>
                        {getStatusBadge(vote.vote_status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(vote.voted_at).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
