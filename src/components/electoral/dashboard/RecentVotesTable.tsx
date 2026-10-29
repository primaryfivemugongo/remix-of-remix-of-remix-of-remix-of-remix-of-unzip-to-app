import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Vote {
  id: string;
  voter_name: string;
  position: string;
  candidate_name: string;
  voted_at: string;
}

interface RecentVotesTableProps {
  votes: Vote[];
  onVoteClick?: (vote: Vote) => void;
  userRole?: string;
}

export function RecentVotesTable({ votes, onVoteClick, userRole }: RecentVotesTableProps) {
  const [search, setSearch] = useState("");
  const [newVoteIds, setNewVoteIds] = useState<Set<string>>(new Set());
  const [previousVoteIds] = useState<Set<string>>(new Set(votes.map(v => v.id)));

  useEffect(() => {
    const currentIds = new Set(votes.map(v => v.id));
    const newIds = new Set(
      votes.filter(v => !previousVoteIds.has(v.id)).map(v => v.id)
    );
    
    if (newIds.size > 0) {
      setNewVoteIds(newIds);
      setTimeout(() => setNewVoteIds(new Set()), 1000);
    }
  }, [votes]);

  const filteredVotes = votes
    .filter(vote => 
      vote.voter_name.toLowerCase().includes(search.toLowerCase()) ||
      vote.candidate_name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 10);

  return (
    <Card className="h-full rounded-xl border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Recent Votes</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Auto-refresh
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search voters or candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-y-auto scrollbar-thin">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow className="border-b-2">
                <TableHead className="text-xs font-semibold uppercase">Voter</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Position</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Candidate</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVotes.map((vote, index) => (
                <TableRow 
                  key={vote.id}
                  className={cn(
                    "transition-colors hover:bg-muted/50 cursor-pointer",
                    newVoteIds.has(vote.id) && "bg-green-50/50 dark:bg-green-950/20 animate-in slide-in-from-top-2"
                  )}
                  onClick={() => onVoteClick?.(vote)}
                >
                  <TableCell className="font-semibold">
                    {userRole === 'admin' ? vote.voter_name : 'Someone'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                      {vote.position}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{vote.candidate_name}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(vote.voted_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
