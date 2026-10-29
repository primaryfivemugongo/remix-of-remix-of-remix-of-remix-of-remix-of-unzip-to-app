import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfessionalCard } from "@/components/ui/professional-card";
import { ProfessionalButton } from "@/components/ui/professional-button";
import {
  BarChart,
  Users,
  Vote,
  TrendingUp,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Vote {
  id: string;
  voter_id: string;
  voter_name: string;
  candidate_id: string;
  candidate_name: string;
  position: string;
  voted_at: string;
  created_at: string;
}

interface VoteStats {
  total_votes: number;
  valid_votes: number;
  invalid_votes: number;
  verified_votes: number;
  unique_voters: number;
  votes_by_position: Record<string, number>;
  votes_by_candidate: Record<string, number>;
}

export function VoteMonitoringTab() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchVotes();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'electoral_votes'
        },
        () => {
          fetchVotes();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      
      // Fetch votes
      const { data: votesData, error: votesError } = await supabase
        .from('electoral_votes')
        .select('*')
        .order('voted_at', { ascending: false })
        .limit(100000); // Set high limit to fetch all votes

      if (votesError) throw votesError;

      // Fetch students to get photos
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, photo_url');

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }

      // Merge photo data with votes
      const votesWithPhotos = (votesData || []).map(vote => {
        const student = students?.find(s => s.id === vote.voter_id);
        return {
          ...vote,
          voter_photo: student?.photo_url
        };
      });
      
      setVotes(votesWithPhotos);
      calculateStats(votesWithPhotos);
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast({
        title: "Error",
        description: "Failed to load voting data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVotes();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Voting data has been updated."
    });
  };

  const calculateStats = (votesData: Vote[]) => {
    const uniqueVoters = new Set(votesData.map(v => v.voter_id)).size;
    const votesByPosition: Record<string, number> = {};
    const votesByCandidate: Record<string, number> = {};
    
    votesData.forEach(vote => {
      votesByPosition[vote.position] = (votesByPosition[vote.position] || 0) + 1;
      votesByCandidate[vote.candidate_name] = (votesByCandidate[vote.candidate_name] || 0) + 1;
    });

    setStats({
      total_votes: votesData.length,
      valid_votes: votesData.length,
      invalid_votes: 0,
      verified_votes: votesData.length,
      unique_voters: uniqueVoters,
      votes_by_position: votesByPosition,
      votes_by_candidate: votesByCandidate
    });
  };

  const downloadVotingReport = async () => {
    try {
      // Generate CSV report
      const headers = ['Voter ID', 'Voter Name', 'Position', 'Candidate', 'Voted At'];
      const rows = filteredVotes.map(vote => [
        vote.voter_id,
        vote.voter_name,
        vote.position,
        vote.candidate_name,
        new Date(vote.voted_at).toLocaleString()
      ]);
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voting-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Voting report has been downloaded."
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate report.",
        variant: "destructive"
      });
    }
  };



  const positions = [...new Set(votes.map(v => v.position))];
  
  const filteredVotes = votes.filter(vote => {
    const matchesPosition = filterPosition === "all" || vote.position === filterPosition;
    return matchesPosition;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span>Loading voting data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <ProfessionalCard 
          variant="elevated" 
          className="border-l-4 border-l-blue-500"
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100">
                <Vote className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                stats?.total_votes || 0
              )}
            </div>
          </CardContent>
        </ProfessionalCard>

        <ProfessionalCard 
          variant="elevated" 
          className="border-l-4 border-l-purple-500"
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique Voters</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-purple-600">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                stats?.unique_voters || 0
              )}
            </div>
          </CardContent>
        </ProfessionalCard>

        <ProfessionalCard 
          variant="elevated" 
          className="border-l-4 border-l-green-500"
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valid Votes</CardTitle>
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                stats?.valid_votes || 0
              )}
            </div>
          </CardContent>
        </ProfessionalCard>

        <ProfessionalCard 
          variant="elevated" 
          className="border-l-4 border-l-red-500"
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Invalid Votes</CardTitle>
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-600">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                stats?.invalid_votes || 0
              )}
            </div>
          </CardContent>
        </ProfessionalCard>

        <ProfessionalCard 
          variant="elevated" 
          className="border-l-4 border-l-orange-500"
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-orange-600">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                stats?.verified_votes || 0
              )}
            </div>
          </CardContent>
        </ProfessionalCard>
      </div>

      {/* Actions Bar */}
      <ProfessionalCard variant="elevated" className="bg-muted/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <ProfessionalButton
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </ProfessionalButton>
              <ProfessionalButton
                onClick={downloadVotingReport}
                variant="default"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </ProfessionalButton>
            </div>
          </div>
        </CardContent>
      </ProfessionalCard>

      {/* Votes List */}
      {filteredVotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Votes Cast Yet</h3>
            <p className="text-muted-foreground text-sm">
              Voting data will appear here once students start casting their votes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredVotes.map((vote) => (
            <ProfessionalCard key={vote.id} variant="bordered" className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1 space-y-2 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base truncate">{vote.voter_name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{vote.voter_id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">Position</p>
                        <p className="font-medium text-primary">{vote.position}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">Voted For</p>
                        <p className="font-medium">{vote.candidate_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">Voted At</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(vote.voted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ProfessionalCard>
          ))}
        </div>
      )}

    </div>
  );
}
