import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Vote, Trophy, Clock, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";

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

interface CandidateVotersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  votes: Vote[];
  candidateName: string;
  position: string;
  isAdmin: boolean;
  onStudentClick?: (vote: Vote) => void;
}

export function CandidateVotersDialog({ 
  open, 
  onOpenChange, 
  votes, 
  candidateName,
  position,
  isAdmin,
  onStudentClick 
}: CandidateVotersDialogProps) {
  // Group votes by hour
  const votesByHour = votes.reduce((acc, vote) => {
    const hour = format(parseISO(vote.voted_at), 'HH:00');
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const peakHour = Object.entries(votesByHour).reduce((max, [hour, count]) => 
    count > max.count ? { hour, count } : max
  , { hour: '', count: 0 });

  // Class distribution
  const classCounts = votes.reduce((acc, vote) => {
    acc[vote.voter_class] = (acc[vote.voter_class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-primary" />
            {candidateName} - {position}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Vote className="h-4 w-4" />
              {votes.length} total votes
            </div>
            {peakHour.count > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Peak at {peakHour.hour}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                  <p className="text-2xl font-bold">{votes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peak Hour</p>
                  <p className="text-2xl font-bold">{peakHour.hour || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Top Class</p>
                  <p className="text-2xl font-bold">
                    {Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Distribution */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Class Distribution:</span>
          {Object.entries(classCounts).map(([className, count]) => (
            <Badge key={className} variant="outline">
              {className}: {count}
            </Badge>
          ))}
        </div>

        {isAdmin ? (
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                Voters ({votes.length})
              </h4>
              {votes.map((vote) => (
                <div
                  key={vote.id}
                  onClick={() => onStudentClick?.(vote)}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                >
                  <PhotoDialog 
                    photoUrl={vote.voter_photo} 
                    userName={vote.voter_name}
                    size="h-10 w-10"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{vote.voter_name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{vote.voter_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {vote.voter_class} - {vote.voter_stream}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(parseISO(vote.voted_at), 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Voter Details Protected</h3>
              <p className="text-sm text-muted-foreground">
                Individual voter information is confidential and only accessible to administrators.
                You can view vote counts and statistics, but not specific voter identities.
              </p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
