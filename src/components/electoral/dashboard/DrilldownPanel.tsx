import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface CandidateDetail {
  candidate_id: string;
  candidate_name: string;
  votes: number;
  percentage: number;
  minuteByMinute: number[];
}

interface DrilldownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  position: string | null;
  candidates: CandidateDetail[];
  onExport: () => void;
}

export function DrilldownPanel({ isOpen, onClose, position, candidates, onExport }: DrilldownPanelProps) {
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
  const winner = candidates.length > 0 ? candidates[0] : null;
  const runnerUp = candidates.length > 1 ? candidates[1] : null;
  const margin = winner && runnerUp ? winner.votes - runnerUp.votes : 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>{position} - Detailed Breakdown</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription>
            Total votes cast: {totalVotes}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {winner && runnerUp && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm font-medium text-muted-foreground mb-1">Current Leader</p>
              <p className="text-lg font-bold text-foreground">{winner.candidate_name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Leading by {margin} {margin === 1 ? 'vote' : 'votes'} ({((margin / totalVotes) * 100).toFixed(1)}% margin)
              </p>
            </Card>
          )}

          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <Card key={candidate.candidate_id} className="p-4 transition-all hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <h4 className="font-semibold text-foreground">{candidate.candidate_name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">ID: {candidate.candidate_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{candidate.votes}</p>
                    <p className="text-sm text-muted-foreground">{candidate.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                
                <Progress value={candidate.percentage} className="h-2 mb-2" />
                
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-muted-foreground">Activity:</span>
                  <div className="flex gap-0.5 flex-1">
                    {candidate.minuteByMinute.map((value, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-primary/20 rounded-sm"
                        style={{ height: `${Math.max(4, value * 8)}px` }}
                        title={`${value} votes`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={onExport} className="w-full" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Position Report
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
