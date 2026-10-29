import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Award, 
  BarChart3,
  Clock,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { InvalidVotesCard } from "@/components/electoral/InvalidVotesCard";
import { LiveResultsHeroGrid } from "@/components/electoral/LiveResultsHeroGrid";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";

interface ResultCandidate {
  id?: string;
  name: string;
  class: string;
  stream: string;
  votes: number;
  percentage: number;
  photo?: string;
}

interface PositionResult {
  id?: string;
  title: string;
  candidates: ResultCandidate[];
  totalVotes: number;
  totalEligible: number;
  totalConfirmedCandidates: number;
}

interface ElectionPhase {
  current: 'applications' | 'voting' | 'results';
  votingStartTime: Date;
  votingEndTime: Date;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export default function LiveResults() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, userName, photoUrl, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [results, setResults] = useState<Record<string, PositionResult>>({});
  const [loading, setLoading] = useState(true);
  const [electionPhase, setElectionPhase] = useState<ElectionPhase>({
    current: 'applications',
    votingStartTime: new Date('2025-10-16T08:00:00+03:00'),
    votingEndTime: new Date('2025-10-17T16:00:00+03:00'),
    timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 }
  });

  // Update election phase and countdown timer
  useEffect(() => {
    const updateElectionPhase = () => {
      const now = new Date().getTime();
      const votingStart = electionPhase.votingStartTime.getTime();
      const votingEnd = electionPhase.votingEndTime.getTime();
      
      let currentPhase: 'applications' | 'voting' | 'results';
      let targetTime: number;
      
      if (now < votingStart) {
        currentPhase = 'applications';
        targetTime = votingStart;
      } else if (now < votingEnd) {
        currentPhase = 'voting';
        targetTime = votingEnd;
      } else {
        currentPhase = 'results';
        targetTime = 0;
      }
      
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      
      if (targetTime > 0) {
        const difference = targetTime - now;
        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          };
        }
      }
      
      setElectionPhase(prev => ({
        ...prev,
        current: currentPhase,
        timeLeft
      }));
    };

    updateElectionPhase();
    const timer = setInterval(updateElectionPhase, 1000);
    
    return () => clearInterval(timer);
  }, [electionPhase.votingStartTime, electionPhase.votingEndTime]);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Load positions
      const { data: positions, error: positionsError } = await supabase
        .from('electoral_rows')
        .select('*')
        .eq('is_active', true);
      
      if (positionsError) throw positionsError;
      
      // Load confirmed applications (realistic candidates)
      const { data: applications, error: applicationsError } = await supabase
        .from('electoral_applications')
        .select('*')
        .eq('status', 'confirmed')
        .order('student_name', { ascending: true });
      
      if (applicationsError) throw applicationsError;
      
      // Count total eligible voters (exclude P1 students)
      const { data: eligibleStudents, count: eligibleCount } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .neq('class_id', 'P1');
      
      const totalEligible = eligibleCount || 0;
      
      // Fetch actual votes from database
      const { data: votesData, error: votesError } = await supabase
        .from('electoral_votes')
        .select('candidate_id, candidate_name, position, vote_status')
        .limit(100000); // Set high limit to fetch all votes
      
      if (votesError) throw votesError;

      // Fetch physical votes
      const { data: physicalVotesData, error: physicalVotesError } = await supabase
        .from('physical_votes')
        .select('candidate_id, candidate_name, position, votes_count')
        .limit(100000);
      
      if (physicalVotesError) throw physicalVotesError;

      // Calculate results for each position
      const calculatedResults: Record<string, PositionResult> = {};
      
      positions?.forEach(position => {
        // Get confirmed candidates for this position
        const positionCandidates = applications?.filter(app => app.position === position.id) || [];
        
        // Count actual votes for each candidate (only valid votes)
        const voteCounts: Record<string, number> = {};
        
        // Add online votes
        (votesData || [])
          .filter(vote => vote.position === position.title && vote.vote_status === 'valid')
          .forEach(vote => {
            voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + 1;
          });
        
        // Add physical votes
        (physicalVotesData || [])
          .filter(vote => vote.position === position.title)
          .forEach(vote => {
            voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + (vote.votes_count || 0);
          });
        
        const candidates: ResultCandidate[] = positionCandidates.map((candidate, index) => {
          const voteCount = voteCounts[candidate.id!] || 0;
          
          // Manually set photos for specific candidates
          let photo = candidate.student_photo;
          const name = candidate.student_name?.toUpperCase() || '';
          
          if (name.includes('JANAT') || name.includes('KALIBBALA')) {
            photo = '/janat.jpg';
          } else if (name.includes('SHANNAH') || name.includes('NAKASUJJA')) {
            photo = '/shannah.jpg';
          }
          
          return {
            id: candidate.id!,
            name: candidate.student_name!,
            class: candidate.class_name!,
            stream: candidate.stream_name!,
            votes: voteCount,
            percentage: 0, // Will calculate after we know total
            photo: photo
          };
        }).sort((a, b) => b.votes - a.votes);
        
        // Calculate total votes from all votes cast for this position (including non-confirmed candidates)
        const totalPositionVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
        
        // Calculate percentages
        candidates.forEach(candidate => {
          candidate.percentage = totalPositionVotes > 0 ? (candidate.votes / totalPositionVotes) * 100 : 0;
        });
        
        calculatedResults[position.id!] = {
          id: position.id!,
          title: position.title!,
          candidates,
          totalVotes: totalPositionVotes,
          totalEligible,
          totalConfirmedCandidates: positionCandidates.length
        };
      });
      
      setResults(calculatedResults);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "Error",
        description: "Failed to load election results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  useEffect(() => {
    loadResults();
    
    // Set up real-time subscription for application status changes
    const channel = supabase
      .channel('election-results-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'electoral_applications'
        },
        () => {
          loadResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-refresh during voting phase
  useEffect(() => {
    if (electionPhase.current === 'voting') {
      const interval = setInterval(() => {
        loadResults();
      }, 30000); // Refresh every 30 seconds during voting
      
      return () => clearInterval(interval);
    }
  }, [electionPhase.current]);

  // Count invalid votes from database
  const [invalidVotesCount, setInvalidVotesCount] = useState(0);
  
  useEffect(() => {
    const fetchInvalidVotes = async () => {
      const { count } = await supabase
        .from('electoral_votes')
        .select('*', { count: 'exact', head: true })
        .eq('vote_status', 'invalid');
      setInvalidVotesCount(count || 0);
    };
    fetchInvalidVotes();
  }, [results]);

  const totalVotesCount = Object.values(results).reduce((sum, position) => sum + position.totalVotes, 0);
  const averageParticipation = Object.keys(results).length > 0 ?
    Object.values(results).reduce((sum, position) => 
      sum + (position.totalVotes / position.totalEligible), 0) / Object.keys(results).length * 100 : 0;
  const totalCandidates = Object.values(results).reduce((sum, position) => sum + position.totalConfirmedCandidates, 0);

  const getPhaseStatus = () => {
    switch (electionPhase.current) {
      case 'applications':
        return {
          text: 'Voting Not Started',
          description: 'Voting will begin soon. Results will be available once voting starts.',
          icon: <Clock className="w-3 h-3 mr-1" />,
          className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
        };
      case 'voting':
        return {
          text: 'Voting in Progress',
          description: 'Live results updating in real-time as votes are cast.',
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        };
      case 'results':
        return {
          text: 'Final Results',
          description: 'Voting has ended. These are the final election results.',
          icon: <Award className="w-3 h-3 mr-1" />,
          className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
        };
    }
  };

  if (!user || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please log in to view election results.</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </div>
    );
  }

  const phaseStatus = getPhaseStatus();

  return (
    <DashboardLayout 
      userRole={userRole} 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={signOut}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/${userRole}/electoral`)}
            className="mb-4 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Electoral Dashboard
          </Button>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              Election Results
            </h1>
            <p className="text-muted-foreground">
              {phaseStatus.description} • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
            <Badge variant="secondary" className={phaseStatus.className}>
              {phaseStatus.icon}
              {phaseStatus.text}
            </Badge>
            
            {/* Countdown Timer */}
            {electionPhase.current !== 'results' && (
              <Card className="mx-auto max-w-md bg-gradient-to-r from-muted/50 to-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {electionPhase.current === 'applications' ? 'Voting starts in:' : 'Voting ends in:'}
                    </span>
                  </div>
                  <div className="flex justify-center gap-4 text-lg font-bold">
                    <div className="text-center">
                      <div className="text-primary">{electionPhase.timeLeft.days}</div>
                      <div className="text-xs text-muted-foreground">days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-primary">{electionPhase.timeLeft.hours}</div>
                      <div className="text-xs text-muted-foreground">hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-primary">{electionPhase.timeLeft.minutes}</div>
                      <div className="text-xs text-muted-foreground">min</div>
                    </div>
                    <div className="text-center">
                      <div className="text-primary">{electionPhase.timeLeft.seconds}</div>
                      <div className="text-xs text-muted-foreground">sec</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <motion.div 
                  className="text-2xl font-bold text-blue-800 dark:text-blue-300"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                >
                  {totalVotesCount}
                </motion.div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Votes Cast</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <motion.div 
                  className="text-2xl font-bold text-green-800 dark:text-green-300"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                >
                  {electionPhase.current === 'applications' ? '0.0' : averageParticipation.toFixed(1)}%
                </motion.div>
                <div className="text-sm text-green-600 dark:text-green-400">Voter Turnout</div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <motion.div 
                  className="text-2xl font-bold text-purple-800 dark:text-purple-300"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                >
                  {Object.keys(results).length}
                </motion.div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Electoral Positions</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <motion.div 
                  className="text-2xl font-bold text-orange-800 dark:text-orange-300"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                >
                  {totalCandidates}
                </motion.div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Confirmed Candidates</div>
              </CardContent>
            </Card>
          </motion.div>

          <InvalidVotesCard
            count={invalidVotesCount}
            isAdmin={userRole === 'admin'}
          />
        </div>

        {/* Hero Grid Section */}
        {electionPhase.current !== 'applications' && Object.keys(results).length > 0 && (
          <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-lg border border-primary/20 p-6 md:p-8">
            <LiveResultsHeroGrid 
              positions={Object.entries(results).map(([key, position]) => ({
                id: key,
                title: position.title,
                candidates: position.candidates.map((candidate, index) => ({
                  id: candidate.id || `${key}-${index}`,
                  name: candidate.name,
                  photo: candidate.photo || null,
                  votes: candidate.votes,
                  class: candidate.class,
                  stream: candidate.stream,
                  rank: index + 1
                }))
              }))}
            />
          </div>
        )}

        {/* Refresh Button */}
        {electionPhase.current !== 'applications' && (
          <div className="flex justify-center">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Results'}
            </Button>
          </div>
        )}

        {/* Pre-voting Notice */}
        {electionPhase.current === 'applications' && (
          <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Voting Period Has Not Started
              </h3>
              <p className="text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
                The voting period will begin on <strong>October 16, 2025 at 8:00 AM</strong> and end on 
                <strong> October 17, 2025 at 4:00 PM</strong>. Results will be displayed in real-time once voting begins.
              </p>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Currently showing confirmed candidates who will appear on the ballot.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results by Position */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center">
            {electionPhase.current === 'applications' ? 'Confirmed Candidates' : 'Results by Position'}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading results...</p>
            </div>
          ) : Object.keys(results).length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Data Available</h3>
              <p className="text-muted-foreground">No confirmed candidates or active positions found.</p>
            </div>
          ) : (
            Object.entries(results).map(([key, position], posIndex) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: posIndex * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:shadow-primary/5 border-l-4 border-l-primary">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 pb-4">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-xl font-semibold">{position.title}</span>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{position.totalConfirmedCandidates} candidates</span>
                      {electionPhase.current !== 'applications' && (
                        <>
                          <BarChart3 className="w-4 h-4 ml-2" />
                          <span>{position.totalVotes} votes cast</span>
                          <Badge variant="outline" className="hidden sm:inline-flex">
                            {position.totalEligible > 0 ? ((position.totalVotes / position.totalEligible) * 100).toFixed(1) : '0'}% turnout
                          </Badge>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  {position.candidates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-8 w-8 mx-auto mb-2" />
                      <p>No confirmed candidates for this position</p>
                    </div>
                  ) : (
                    position.candidates.map((candidate, index) => (
                      <div key={index} className="space-y-3 p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {candidate.photo && (
                              <img 
                                src={candidate.photo} 
                                alt={candidate.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-lg">{candidate.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {candidate.class} - {candidate.stream}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {electionPhase.current !== 'applications' ? (
                              <>
                                <div className="text-2xl font-bold text-primary">{candidate.votes}</div>
                                <div className="text-sm font-medium text-muted-foreground">
                                  {candidate.percentage.toFixed(1)}%
                                </div>
                              </>
                            ) : (
                              <Badge variant="outline">Candidate</Badge>
                            )}
                          </div>
                        </div>
                        
                        {electionPhase.current !== 'applications' && (
                          <>
                            <motion.div
                              initial={{ scaleX: 0 }}
                              whileInView={{ scaleX: 1 }}
                              viewport={{ once: true }}
                              transition={{ 
                                duration: 0.8, 
                                delay: index * 0.1,
                                ease: [0.25, 0.46, 0.45, 0.94]
                              }}
                              style={{ transformOrigin: "left" }}
                            >
                              <Progress 
                                value={candidate.percentage} 
                                className="h-3"
                              />
                            </motion.div>
                            
                            {index === 0 && candidate.votes > 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                              >
                                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-300 dark:from-yellow-600 dark:to-yellow-700 dark:text-yellow-100">
                                  <Award className="w-3 h-3 mr-1" />
                                  Currently Leading
                                </Badge>
                              </motion.div>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Enhanced Footer Information */}
        <Card className="bg-gradient-to-r from-muted/20 to-muted/10">
          <CardContent className="p-6 text-center space-y-3">
            <h3 className="font-semibold">Election Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <strong>Voting Period:</strong><br />
                October 16-17, 2025<br />
                8:00 AM - 4:00 PM
              </div>
              <div>
                <strong>Eligible Voters:</strong><br />
                Students from P2-P7<br />
                (P1 students excluded)
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {electionPhase.current === 'applications' && 'Results will be updated in real-time once voting begins.'}
              {electionPhase.current === 'voting' && 'Results are updated in real-time as votes are cast.'}
              {electionPhase.current === 'results' && 'Final results have been confirmed and voting has ended.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}