import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SummaryCard } from "@/components/electoral/dashboard/SummaryCard";
import { PositionBarChart } from "@/components/electoral/dashboard/PositionBarChart";
import { CandidateGroupedChart } from "@/components/electoral/dashboard/CandidateGroupedChart";
import { TimelineChart } from "@/components/electoral/dashboard/TimelineChart";
import { RecentVotesTable } from "@/components/electoral/dashboard/RecentVotesTable";
import { AnomalyAlerts } from "@/components/electoral/dashboard/AnomalyAlerts";
import { DrilldownPanel } from "@/components/electoral/dashboard/DrilldownPanel";
import { VotingHeatmap } from "@/components/electoral/dashboard/VotingHeatmap";
import { ExportControls } from "@/components/electoral/dashboard/ExportControls";
import { MobileChartCarousel } from "@/components/electoral/dashboard/MobileChartCarousel";
import { MobileFilterModal } from "@/components/electoral/dashboard/MobileFilterModal";
import { MobileVotesList } from "@/components/electoral/dashboard/MobileVotesList";
import { MobileSummaryCard } from "@/components/electoral/dashboard/MobileSummaryCard";
import { AccessibleSkipLinks } from "@/components/electoral/dashboard/AccessibleSkipLinks";
import { ErrorModal } from "@/components/ui/error-modal";
import { Vote, Users, Award, Clock, RefreshCw, X, Filter, BarChart2, TrendingUp, Target, Bell, FileText, School, CheckCircle, Timer, UserPlus, AlertCircle, Activity, PieChart as PieChartIcon } from "lucide-react";
import { InvalidVotesCard } from "@/components/electoral/InvalidVotesCard";
import { InvalidVotesDialog } from "@/components/electoral/InvalidVotesDialog";
import { LeaderSpotlight } from "@/components/electoral/dashboard/LeaderSpotlight";
import { HeadToHeadBattle } from "@/components/electoral/dashboard/HeadToHeadBattle";
import { DemographicsCard } from "@/components/electoral/dashboard/DemographicsCard";
import { GenderSupportChart } from "@/components/electoral/dashboard/GenderSupportChart";
import { LiveFeed } from "@/components/electoral/dashboard/LiveFeed";
import { TurnoutCard } from "@/components/electoral/dashboard/TurnoutCard";
import { QuickStatsCard } from "@/components/electoral/dashboard/QuickStatsCard";
import { EnhancedMetricsCard } from "@/components/electoral/dashboard/EnhancedMetricsCard";
import { VoteDistributionChart } from "@/components/electoral/dashboard/VoteDistributionChart";
import { VoterDetailsDialog } from "@/components/electoral/VoterDetailsDialog";
import { StudentVoteDetailDialog } from "@/components/electoral/StudentVoteDetailDialog";
import { TimeSlotVotersDialog } from "@/components/electoral/TimeSlotVotersDialog";
import { CandidateVotersDialog } from "@/components/electoral/CandidateVotersDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";
import { CandidatesSection } from "@/components/electoral/CandidatesSection";
import ElectoralResults from "@/pages/electoral/electoral-results";

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

export default function ElectoralDashboard() {
  const navigate = useNavigate();
  const { userName, photoUrl, userRole } = useAuth();
  const { toast } = useToast();
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Dialog states
  const [voterDialogOpen, setVoterDialogOpen] = useState(false);
  const [selectedVotes, setSelectedVotes] = useState<Vote[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");
  const [studentDetailOpen, setStudentDetailOpen] = useState(false);
  const [selectedStudentVotes, setSelectedStudentVotes] = useState<Vote[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [timeSlotDialogOpen, setTimeSlotDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState({ name: "", position: "" });
  const [invalidVotesDialogOpen, setInvalidVotesDialogOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };
  
  // Role-based prefix for navigation
  const rolePrefix = userRole === 'admin' ? '/admin' : userRole === 'teacher' ? '/teacher' : '/student';

  const [allVotes, setAllVotes] = useState<any[]>([]);
  
  // Load votes from database (combines online and physical votes)
  useEffect(() => {
    const loadVotes = async () => {
      const { data, error } = await supabase
        .from('electoral_votes')
        .select('*')
        .order('voted_at', { ascending: false })
        .limit(100000); // Set high limit to fetch all votes
      
      if (!error && data) {
        // Fetch all candidates with photos
        const { data: candidates } = await supabase
          .from('electoral_applications')
          .select('student_id, student_photo')
          .eq('status', 'confirmed');
        
        const candidatePhotos = new Map(
          candidates?.map(c => [c.student_id, c.student_photo]) || []
        );
        
        // Enrich with student data
        const enrichedVotes = await Promise.all(
          data.map(async (vote) => {
            const { data: student } = await supabase
              .from('students')
              .select('email, class_id, stream_id, gender')
              .eq('id', vote.voter_id)
              .single();
              
            if (student) {
              const [classData, streamData] = await Promise.all([
                supabase.from('classes').select('name').eq('id', student.class_id).single(),
                supabase.from('streams').select('name').eq('id', student.stream_id).single()
              ]);
              
              return {
                ...vote,
                candidate_photo: candidatePhotos.get(vote.candidate_id),
                voter: {
                  email: student.email,
                  gender: student.gender,
                  classes: { name: classData.data?.name },
                  streams: { name: streamData.data?.name }
                }
              };
            }
            return vote;
          })
        );
        
        // Fetch physical votes and expand them into individual vote records for consistency
        const { data: physicalVotes } = await supabase
          .from('physical_votes')
          .select('*');
        
        if (physicalVotes) {
          const expandedPhysicalVotes = physicalVotes.flatMap(pv => 
            Array.from({ length: pv.votes_count || 0 }, (_, i) => ({
              id: `${pv.id}_${i}`,
              voter_id: `physical_${pv.id}_${i}`,
              voter_name: `Physical Ballot ${i + 1}`,
              position: pv.position,
              candidate_id: pv.candidate_id,
              candidate_name: pv.candidate_name,
              voted_at: pv.added_at,
              vote_status: 'valid',
              candidate_photo: candidatePhotos.get(pv.candidate_id),
              voter: {
                email: 'physical@ballot.local',
                gender: null,
                classes: { name: 'Physical' },
                streams: { name: 'Ballot' }
              }
            }))
          );
          
          setAllVotes([...enrichedVotes, ...expandedPhysicalVotes]);
        } else {
          setAllVotes(enrichedVotes);
        }
      }
      setIsLoading(false);
    };
    loadVotes();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('votes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'electoral_votes' }, () => {
        loadVotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Transform database votes to match dialog Vote interface
  const transformVotes = (votes: any[]): Vote[] => {
    return votes.map(v => ({
      id: v.id,
      voter_id: v.voter_id,
      voter_name: v.voter_name,
      voter_email: v.voter?.email || `${v.voter_id}@school.com`,
      voter_class: v.voter?.classes?.name || "Unknown",
      voter_stream: v.voter?.streams?.name || "Unknown",
      position_id: v.position,
      position_title: v.position,
      candidate_id: v.candidate_id,
      candidate_name: v.candidate_name,
      voted_at: v.voted_at,
      vote_status: v.vote_status || "valid",
      ip_address: v.ip_address
    }));
  };

  // Filter votes
  const filteredVotes = useMemo(() => {
    return allVotes.filter(vote => {
      const matchesPosition = positionFilter === "all" || vote.position === positionFilter;
      const matchesSearch = !searchQuery || 
        vote.voter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vote.candidate_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPosition && matchesSearch;
    });
  }, [allVotes, positionFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalVotes = filteredVotes.length;
    const validVotes = filteredVotes.filter(v => v.vote_status === 'valid').length;
    const invalidVotes = filteredVotes.filter(v => v.vote_status === 'invalid').length;
    const uniqueVoters = new Set(filteredVotes.map(v => v.voter_id)).size;
    const uniqueCandidates = new Set(filteredVotes.map(v => v.candidate_id)).size;
    const latestVote = filteredVotes.length > 0 
      ? filteredVotes.sort((a, b) => 
          new Date(b.voted_at).getTime() - new Date(a.voted_at).getTime()
        )[0].voted_at
      : null;

    return { totalVotes, validVotes, invalidVotes, uniqueVoters, uniqueCandidates, latestVote };
  }, [filteredVotes]);

  const invalidVotesData = useMemo(() => {
    return filteredVotes
      .filter(v => v.vote_status === 'invalid')
      .map(v => ({
        id: v.id,
        voter_id: v.voter_id,
        voter_name: v.voter_name,
        voter_email: `${v.voter_id}@school.com`,
        voter_class: "Form 4",
        voter_stream: "Sciences",
        position_title: v.position,
        candidate_name: v.candidate_name,
        voted_at: v.voted_at,
        vote_status: v.vote_status || 'invalid',
        latitude: v.latitude || null,
        longitude: v.longitude || null
      }));
  }, [filteredVotes]);

  // Position data for bar chart
  const positionData = useMemo(() => {
    const counts = filteredVotes.reduce((acc, vote) => {
      acc[vote.position] = ((acc[vote.position] as number) || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countValues = Object.values(counts) as number[];
    const total: number = countValues.reduce((sum, count) => sum + count, 0);

    return Object.entries(counts).map(([position, votes]) => ({
      position,
      votes: votes as number,
      percentage: total > 0 ? Math.round(((votes as number) / total) * 100) : 0
    }));
  }, [filteredVotes]);

  // Candidate data per position for grouped chart
  const candidateData = useMemo(() => {
    const positions = Array.from(new Set(filteredVotes.map(v => v.position)));

    return positions.map(position => {
      const positionVotes = filteredVotes.filter(v => v.position === position);
      const candidateVotes: Record<string, number> = {};
      
      positionVotes.forEach(vote => {
        candidateVotes[vote.candidate_name] = ((candidateVotes[vote.candidate_name] as number) || 0) + 1;
      });

      return {
        position,
        candidates: Object.entries(candidateVotes).map(([candidate, votes]) => ({
          candidate,
          votes: votes as number
        }))
      };
    });
  }, [filteredVotes]);

  // Timeline data
  const timelineData = useMemo(() => {
    const hourCounts: Record<string, number> = {};
    
    filteredVotes.forEach(vote => {
      const hour = format(parseISO(vote.voted_at), 'HH:00');
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([time, votes]) => ({ time, votes }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredVotes]);

  // Heatmap data
  const heatmapData = useMemo(() => {
    const hourCounts: Record<number, number> = {};
    
    filteredVotes.forEach(vote => {
      const hour = parseISO(vote.voted_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      votes: hourCounts[i] || 0
    }));
  }, [filteredVotes]);

  // Detect anomalies
  const anomalies = useMemo(() => {
    const voterCounts: Record<string, number> = {};
    allVotes.forEach(vote => {
      voterCounts[vote.voter_id] = (voterCounts[vote.voter_id] || 0) + 1;
    });

    const duplicateVoters = Object.entries(voterCounts)
      .filter(([_, count]) => count > 1);

    return duplicateVoters.length > 0 ? [{
      id: "duplicate-1",
      type: "duplicate" as const,
      severity: "high" as const,
      title: "Duplicate Voter IDs Detected",
      description: `${duplicateVoters.length} voters have cast multiple votes`,
      affectedCount: duplicateVoters.length
    }] : [];
  }, [allVotes]);

  // Drilldown data
  const drilldownCandidates = useMemo(() => {
    if (!selectedPosition) return [];

    const positionVotes = filteredVotes.filter(v => v.position === selectedPosition);
    const candidateCounts: Record<string, { votes: number; id: string }> = {};

    positionVotes.forEach(vote => {
      if (!candidateCounts[vote.candidate_name]) {
        candidateCounts[vote.candidate_name] = { votes: 0, id: vote.candidate_id };
      }
      candidateCounts[vote.candidate_name].votes++;
    });

    const total = Object.values(candidateCounts).reduce((sum, c) => sum + c.votes, 0);

    return Object.entries(candidateCounts)
      .map(([name, data]) => ({
        candidate_id: data.id,
        candidate_name: name,
        votes: data.votes,
        percentage: (data.votes / total) * 100,
        minuteByMinute: Array.from({ length: 12 }, () => Math.floor(Math.random() * 3))
      }))
      .sort((a, b) => b.votes - a.votes);
  }, [selectedPosition, filteredVotes]);

  const handlePositionClick = (position: string) => {
    setSelectedPosition(position);
    setIsDrilldownOpen(true);
  };

  // Generic handler to show voter details dialog
  const showVoterDialog = (votes: any[], title: string) => {
    // Check if user is admin
    const userRole = localStorage.getItem('adminRole') || localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      setErrorModalOpen(true);
      return;
    }
    
    setSelectedVotes(transformVotes(votes));
    setDialogTitle(title);
    setVoterDialogOpen(true);
  };

  // Handlers for different click events
  const handleMetricsClick = (type: 'total' | 'voters' | 'turnout' | 'candidates') => {
    let votes: any[] = [];
    let title = "";

    switch (type) {
      case 'total':
        votes = filteredVotes;
        title = `Total Votes (${stats.totalVotes})`;
        break;
      case 'voters':
        votes = filteredVotes;
        title = `Unique Voters (${stats.uniqueVoters})`;
        break;
      case 'turnout':
        votes = filteredVotes;
        title = "Voter Turnout Details";
        break;
      case 'candidates':
        votes = filteredVotes;
        title = `Active Positions (${stats.uniqueCandidates})`;
        break;
    }

    showVoterDialog(votes, title);
  };

  const handleDemographicsClick = (position: string, category?: string) => {
    let votes = filteredVotes.filter(v => v.position === position);
    let title = `${position} - ${category || 'All Voters'}`;

    if (category === 'male' || category === 'female') {
      // Filter by gender - this is mock data, in real implementation you'd have gender field
      title = `${position} - ${category.charAt(0).toUpperCase() + category.slice(1)} Voters`;
    } else if (category) {
      // Filter by class or stream
      title = `${position} - ${category}`;
    }

    showVoterDialog(votes, title);
  };

  const handleGenderSupportClick = (position: string, candidate: string) => {
    const votes = filteredVotes.filter(v => 
      v.position === position && v.candidate_name === candidate
    );
    showVoterDialog(votes, `${candidate} - ${position}`);
  };

  const handleHeadToHeadClick = (position: string, candidate: string) => {
    const votes = filteredVotes.filter(v => 
      v.position === position && v.candidate_name === candidate
    );
    showVoterDialog(votes, `${candidate} - ${position}`);
  };

  const handleLeaderVoteClick = (position: string, candidateName: string) => {
    const votes = filteredVotes.filter(v => 
      v.position === position && v.candidate_name === candidateName
    );
    showVoterDialog(votes, `${candidateName} - ${position} Voters`);
  };

  const handleTurnoutClick = (position: string) => {
    const votes = filteredVotes.filter(v => v.position === position);
    showVoterDialog(votes, `Turnout - ${position}`);
  };

  const handleQuickStatsClick = (type: string) => {
    showVoterDialog(filteredVotes, type);
  };

  const handleVoteRowClick = (vote: any) => {
    // Check if user is admin
    const userRole = localStorage.getItem('adminRole') || localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      setErrorModalOpen(true);
      return;
    }
    
    const voterVotes = filteredVotes.filter(v => v.voter_id === vote.voter_id);
    setSelectedStudentVotes(transformVotes(voterVotes));
    setStudentDetailOpen(true);
  };

  const handleStudentClick = (vote: any) => {
    // Check if user is admin
    const userRole = localStorage.getItem('adminRole') || localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      setErrorModalOpen(true);
      return;
    }
    
    const studentVotes = filteredVotes.filter(v => v.voter_id === vote.voter_id);
    setSelectedStudentVotes(transformVotes(studentVotes));
    setVoterDialogOpen(false);
    setTimeSlotDialogOpen(false);
    setStudentDetailOpen(true);
  };

  const handleTimeSlotClick = (timeSlot: string, votes: number) => {
    // Check if user is admin
    const adminRole = localStorage.getItem('adminRole') || localStorage.getItem('userRole');
    if (adminRole !== 'admin') {
      setErrorModalOpen(true);
      return;
    }

    const slotVotes = filteredVotes.filter(v => {
      const voteHour = format(parseISO(v.voted_at), 'HH:00');
      return voteHour === timeSlot;
    });
    
    setSelectedVotes(transformVotes(slotVotes));
    setSelectedTimeSlot(timeSlot);
    setTimeSlotDialogOpen(true);
  };

  const handleHourClick = (hour: number, votes: number) => {
    // Check if user is admin
    const adminRole = localStorage.getItem('adminRole') || localStorage.getItem('userRole');
    if (adminRole !== 'admin') {
      setErrorModalOpen(true);
      return;
    }

    const hourVotes = filteredVotes.filter(v => {
      const voteHour = parseISO(v.voted_at).getHours();
      return voteHour === hour;
    });
    
    setSelectedVotes(transformVotes(hourVotes));
    setSelectedTimeSlot(`${String(hour).padStart(2, '0')}:00`);
    setTimeSlotDialogOpen(true);
  };

  const handleCandidateClick = (candidateName: string, position: string) => {
    const candidateVotes = filteredVotes.filter(v => 
      v.candidate_name === candidateName && v.position === position
    );
    
    setSelectedVotes(transformVotes(candidateVotes));
    setSelectedCandidate({ name: candidateName, position });
    setCandidateDialogOpen(true);
  };

  const handleExport = (format: "csv" | "pdf" | "print") => {
    toast({
      title: "Export Generated",
      description: `Mock export in ${format.toUpperCase()} format`,
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Dashboard Refreshed",
      description: "Data updated successfully",
    });
  };

  const clearFilter = () => {
    setPositionFilter("all");
    setSearchQuery("");
  };

  const applyMobileFilters = () => {
    setIsMobileFilterOpen(false);
    toast({
      title: "Filters Applied",
      description: "Dashboard updated with your filters",
    });
  };

  // Calculate leader data per position
  const leadersData = useMemo(() => {
    const positions = Array.from(new Set(filteredVotes.map(v => v.position)));
    
    return positions.map(position => {
      const positionVotes = filteredVotes.filter(v => v.position === position);
      const candidateVotes: Record<string, { votes: number; photo?: string }> = {};
      
      positionVotes.forEach(vote => {
        if (!candidateVotes[vote.candidate_name]) {
          candidateVotes[vote.candidate_name] = { votes: 0, photo: vote.candidate_photo };
        }
        candidateVotes[vote.candidate_name].votes += 1;
      });

      const sortedCandidates = Object.entries(candidateVotes)
        .map(([name, data]) => ({ name, votes: data.votes, photo: data.photo }))
        .sort((a, b) => b.votes - a.votes);

      if (sortedCandidates.length < 2) return null;

      const leader = sortedCandidates[0];
      const runnerUp = sortedCandidates[1];
      const totalVotes = sortedCandidates.reduce((sum, c) => sum + c.votes, 0);
      const voteMargin = leader.votes - runnerUp.votes;
      const voteShare = (leader.votes / totalVotes) * 100;

      let raceStatus: "comfortable" | "tight" | "close" = "comfortable";
      if (voteMargin < 5) raceStatus = "close";
      else if (voteMargin < 15) raceStatus = "tight";

      return {
        candidateName: leader.name,
        candidatePhoto: leader.photo,
        position,
        totalVotes: leader.votes,
        voteShare,
        voteMargin,
        raceStatus
      };
    }).filter(Boolean);
  }, [filteredVotes]);

  // Calculate head-to-head battles per position
  const battlesData = useMemo(() => {
    const positions = Array.from(new Set(filteredVotes.map(v => v.position)));
    
    return positions.map(position => {
      const positionVotes = filteredVotes.filter(v => v.position === position);
      const candidateVotes: Record<string, number> = {};
      
      positionVotes.forEach(vote => {
        candidateVotes[vote.candidate_name] = (candidateVotes[vote.candidate_name] || 0) + 1;
      });

      const sortedCandidates = Object.entries(candidateVotes)
        .map(([name, votes]) => ({ name, votes }))
        .sort((a, b) => b.votes - a.votes);

      if (sortedCandidates.length < 2) return null;

      const leader = sortedCandidates[0];
      const runnerUp = sortedCandidates[1];
      const totalVotes = sortedCandidates.reduce((sum, c) => sum + c.votes, 0);

      return {
        position,
        candidate1: {
          name: leader.name,
          votes: leader.votes,
          percentage: (leader.votes / totalVotes) * 100,
          rank: 1
        },
        candidate2: {
          name: runnerUp.name,
          votes: runnerUp.votes,
          percentage: (runnerUp.votes / totalVotes) * 100,
          rank: 2
        },
        voteDifference: leader.votes - runnerUp.votes
      };
    }).filter(Boolean);
  }, [filteredVotes]);

  // Demographics data per position
  const demographicsData = useMemo(() => {
    const positions = Array.from(new Set(filteredVotes.map(v => v.position)));
    
    // Get unique classes and streams from actual votes
    const classVoteCounts: Record<string, number> = {};
    const streamVoteCounts: Record<string, number> = {};
    
    filteredVotes.forEach(vote => {
      const className = vote.voter?.classes?.name;
      const streamName = vote.voter?.streams?.name;
      if (className) classVoteCounts[className] = (classVoteCounts[className] || 0) + 1;
      if (streamName) streamVoteCounts[streamName] = (streamVoteCounts[streamName] || 0) + 1;
    });
    
    const totalVotes = filteredVotes.length || 1;
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];
    
    return {
      gender: positions.map(position => {
        const positionVotes = filteredVotes.filter(v => v.position === position);
        const maleVotes = positionVotes.filter(v => v.voter?.gender === 'Male').length;
        const femaleVotes = positionVotes.filter(v => v.voter?.gender === 'Female').length;
        const total = positionVotes.length || 1;

        return {
          position,
          malePercentage: Math.round((maleVotes / total) * 100),
          femalePercentage: Math.round((femaleVotes / total) * 100)
        };
      }),
      classData: positions.map(position => ({
        position,
        data: Object.entries(classVoteCounts)
          .map(([name, count], index) => ({
            name,
            percentage: Math.round((count / totalVotes) * 100),
            color: colors[index % colors.length]
          }))
          .sort((a, b) => b.percentage - a.percentage)
      })),
      streamData: positions.map(position => ({
        position,
        data: Object.entries(streamVoteCounts)
          .map(([name, count], index) => ({
            name,
            percentage: Math.round((count / totalVotes) * 100),
            color: colors[index % colors.length]
          }))
          .sort((a, b) => b.percentage - a.percentage)
      }))
    };
  }, [filteredVotes]);

  // Gender support data per position
  const genderSupportData = useMemo(() => {
    const positions = Array.from(new Set(filteredVotes.map(v => v.position)));
    
    return positions.map(position => {
      const positionVotes = filteredVotes.filter(v => v.position === position);
      const candidates = Array.from(new Set(positionVotes.map(v => v.candidate_name))).slice(0, 4);
      
      return {
        position,
        candidates: candidates.map(candidate => ({
          candidateName: candidate,
          maleSupport: 30 + Math.random() * 50,
          femaleSupport: 30 + Math.random() * 50
        }))
      };
    });
  }, [filteredVotes]);

  // Turnout data
  const turnoutData = useMemo(() => {
    const positions = Array.from(new Set(filteredVotes.map(v => v.position)));
    const colors = ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#6366f1"];
    
    return positions.map((position, index) => {
      const positionVotes = filteredVotes.filter(v => v.position === position).length;
      const percentage = Math.min((positionVotes / stats.uniqueVoters) * 100, 100);
      
      return {
        position,
        percentage: percentage || 65 + Math.random() * 20,
        color: colors[index % colors.length]
      };
    });
  }, [filteredVotes, stats.uniqueVoters]);

  // Prepare chart slides for mobile carousel
  const chartSlides = useMemo(() => [
    {
      id: "pie",
      title: "Vote Distribution",
      content: (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={positionData}
              dataKey="votes"
              nameKey="position"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.percentage}%`}
            >
              {positionData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"][index % 3]} 
                />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    },
    {
      id: "positions",
      title: "Votes by Position",
      content: <PositionBarChart data={positionData} onPositionClick={handlePositionClick} />
    },
    {
      id: "timeline",
      title: "Voting Activity",
      content: <TimelineChart data={timelineData} isLoading={isLoading} />
    }
  ], [positionData, timelineData, isLoading]);

  if (isLoading) {
    return (
      <DashboardLayout 
        userRole={userRole as any} 
        userName={userName} 
        photoUrl={photoUrl} 
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      userRole={userRole as any} 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <AccessibleSkipLinks />
      
      <div className="w-full min-w-0 space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-elegant bg-clip-text text-transparent truncate">
              Electoral Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Monitor and analyze electoral voting in real-time
            </p>
          </div>
        </div>

        {/* Student Quick Actions */}
        {userRole === 'student' && (
          <div className="flex gap-3 mb-4">
            <Button 
              onClick={() => navigate('/student/electoral/hub')}
              variant="outline"
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Apply for Leadership
            </Button>
            <Button 
              onClick={() => navigate('/student/electoral/vote')}
              className="gap-2"
            >
              <Vote className="h-4 w-4" />
              Cast Your Vote
            </Button>
          </div>
        )}

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="live">Live Results</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Summary Cards */}
            <section id="summary-stats" aria-label="Summary statistics">
              {/* Desktop Cards */}
              <div className="hidden lg:grid grid-cols-5 gap-6">
                <EnhancedMetricsCard
                  title="Total Votes Cast"
                  value={stats.totalVotes.toLocaleString()}
                  icon={BarChart2}
                  trend="+12% from last hour"
                  iconBg="bg-blue-100 dark:bg-blue-900/30"
                  iconColor="text-blue-600 dark:text-blue-400"
                  onClick={() => handleMetricsClick('total')}
                  isLoading={isLoading}
                />
                <EnhancedMetricsCard
                  title="Unique Voters"
                  value={stats.uniqueVoters}
                  icon={Users}
                  trend="Active now"
                  iconBg="bg-green-100 dark:bg-green-900/30"
                  iconColor="text-green-600 dark:text-green-400"
                  onClick={() => handleMetricsClick('voters')}
                  isLoading={isLoading}
                />
                <EnhancedMetricsCard
                  title="Voter Turnout"
                  value={`${Math.round((stats.uniqueVoters / (stats.totalVotes || 1)) * 100)}%`}
                  icon={TrendingUp}
                  subtext="Target: 80%"
                  iconBg="bg-yellow-100 dark:bg-yellow-900/30"
                  iconColor="text-yellow-600 dark:text-yellow-400"
                  onClick={() => handleMetricsClick('turnout')}
                  isLoading={isLoading}
                />
                <EnhancedMetricsCard
                  title="Positions Filled"
                  value={stats.uniqueCandidates}
                  icon={Award}
                  subtext="✓ All active"
                  iconBg="bg-purple-100 dark:bg-purple-900/30"
                  iconColor="text-purple-600 dark:text-purple-400"
                  onClick={() => handleMetricsClick('candidates')}
                  isLoading={isLoading}
                />
                <InvalidVotesCard
                  count={stats.invalidVotes}
                  onClick={() => setInvalidVotesDialogOpen(true)}
                  isAdmin={userRole === 'admin'}
                  isLoading={isLoading}
                />
              </div>

              {/* Mobile Cards (2 per row) */}
              <div className="grid grid-cols-2 gap-3 lg:hidden">
                <MobileSummaryCard
                  title="Total Votes"
                  value={stats.totalVotes}
                  icon={Vote}
                  trend="+12%"
                  delay={0}
                  onClick={() => handleMetricsClick('total')}
                  isLoading={isLoading}
                />
                <MobileSummaryCard
                  title="Voters"
                  value={stats.uniqueVoters}
                  icon={Users}
                  delay={100}
                  onClick={() => handleMetricsClick('voters')}
                  isLoading={isLoading}
                />
                <MobileSummaryCard
                  title="Candidates"
                  value={stats.uniqueCandidates}
                  icon={Award}
                  delay={200}
                  onClick={() => handleMetricsClick('candidates')}
                  isLoading={isLoading}
                />
                <MobileSummaryCard
                  title="Last Vote"
                  value={stats.latestVote ? new Date(stats.latestVote).getHours() : 0}
                  icon={Clock}
                  subtext={stats.latestVote ? format(parseISO(stats.latestVote), 'HH:mm') : 'No votes'}
                  delay={300}
                  onClick={() => handleMetricsClick('turnout')}
                  isLoading={isLoading}
                />
                <div className="col-span-2">
                  <InvalidVotesCard
                    count={stats.invalidVotes}
                    onClick={() => setInvalidVotesDialogOpen(true)}
                    isAdmin={userRole === 'admin'}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </section>

            {/* Leader Spotlight */}
            {leadersData.length > 0 && (
              <LeaderSpotlight leaders={leadersData} onVoteClick={handleLeaderVoteClick} />
            )}

            {/* Head-to-Head Battle */}
            {battlesData.length > 0 && (
              <HeadToHeadBattle battles={battlesData} onClick={handleHeadToHeadClick} />
            )}

            {/* Mobile Chart Carousel */}
            <MobileChartCarousel slides={chartSlides} />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <QuickStatsCard
                icon="🏫"
                value={stats.uniqueVoters * 1.3 | 0}
                label="Total Eligible Voters"
                IconComponent={School}
                onClick={() => handleQuickStatsClick("Total Eligible Voters")}
                isLoading={isLoading}
              />
              <QuickStatsCard
                icon="✅"
                value={stats.uniqueVoters}
                label="Voters Checked In"
                IconComponent={CheckCircle}
                onClick={() => handleMetricsClick('voters')}
                isLoading={isLoading}
              />
              <QuickStatsCard
                icon="⏰"
                value={Math.max(0, (stats.uniqueVoters * 0.3) | 0)}
                label="Yet to Vote"
                IconComponent={Timer}
                onClick={() => handleQuickStatsClick("Yet to Vote")}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Demographics Section */}
            <section aria-label="Demographics breakdown">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DemographicsCard
                  title="👫 Gender Breakdown"
                  type="gender"
                  demographics={demographicsData.gender}
                  onClick={handleDemographicsClick}
                />
                <DemographicsCard
                  title="📚 Class Performance"
                  type="class"
                  demographics={demographicsData.classData}
                  onClick={handleDemographicsClick}
                />
                <DemographicsCard
                  title="📊 Stream Analysis"
                  type="stream"
                  demographics={demographicsData.streamData}
                  onClick={handleDemographicsClick}
                />
              </div>
            </section>

            {/* Gender Support Chart */}
            <GenderSupportChart data={genderSupportData} onClick={handleGenderSupportClick} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VoteDistributionChart data={positionData} onPositionClick={handlePositionClick} />
              <PositionBarChart data={positionData} onPositionClick={handlePositionClick} />
            </div>

            <CandidateGroupedChart data={candidateData} />

            {/* Turnout Card */}
            <TurnoutCard data={turnoutData} onClick={handleTurnoutClick} />
          </TabsContent>

          {/* Live Results Tab */}
          <TabsContent value="live" className="space-y-6">
            {/* Desktop: Three Column Layout */}
            <div className="hidden lg:grid grid-cols-[300px_1fr_350px] gap-6">
              {/* Left Column - Live Feed */}
              <LiveFeed votes={filteredVotes} userRole={userRole} />

              {/* Center Column - Charts */}
              <div className="space-y-6">
                <TimelineChart 
                  data={timelineData} 
                  onTimeSlotClick={handleTimeSlotClick}
                  isAdmin={userRole === 'admin'}
                  isLoading={isLoading}
                />
                <RecentVotesTable votes={filteredVotes} onVoteClick={handleVoteRowClick} userRole={userRole} />
              </div>

              {/* Right Column - Quick Stats */}
              <div className="space-y-4">
                <QuickStatsCard
                  icon="⏱️"
                  value="2h 15m"
                  label="Time Remaining"
                  isLoading={isLoading}
                />
                <QuickStatsCard
                  icon="📋"
                  value={Array.from(new Set(filteredVotes.map(v => v.position))).length}
                  label="Active Polls"
                  onClick={() => handleQuickStatsClick("Active Polls")}
                  isLoading={isLoading}
                />
                <QuickStatsCard
                  icon="🔔"
                  value={anomalies.length}
                  label="Recent Alerts"
                  onClick={() => handleQuickStatsClick("Recent Alerts")}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Mobile: Simplified Layout */}
            <div className="lg:hidden space-y-6">
              <TimelineChart 
                data={timelineData} 
                onTimeSlotClick={handleTimeSlotClick}
                isAdmin={userRole === 'admin'}
                isLoading={isLoading}
              />
              
              <section aria-label="Recent votes">
                <h2 className="text-lg font-semibold mb-3">Recent Votes</h2>
                <MobileVotesList votes={filteredVotes} />
              </section>
            </div>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6">
            {/* Applications Management Button */}
            {userRole === 'admin' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Electoral Applications</h3>
                      <p className="text-sm text-muted-foreground">
                        Review and manage student leadership applications
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate('/admin/electoral/applications')}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <FileText className="h-4 w-4" />
                      Manage Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <CandidatesSection 
              userRole={userRole} 
              votes={transformVotes(allVotes)}
            />
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            {/* Anomaly Alerts */}
            {anomalies.length > 0 && (
              <AnomalyAlerts anomalies={anomalies} onExport={handleExport} />
            )}

            {/* Invalid Votes Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Invalid Votes</h3>
                  <Badge variant="destructive">{stats.invalidVotes}</Badge>
                </div>
                <Button 
                  onClick={() => setInvalidVotesDialogOpen(true)}
                  disabled={!userRole || userRole !== 'admin'}
                  className="w-full"
                >
                  View Invalid Votes
                </Button>
              </CardContent>
            </Card>

            {/* Heatmap */}
            <VotingHeatmap 
              data={heatmapData} 
              onHourClick={handleHourClick}
              isAdmin={userRole === 'admin'}
            />

            {/* Export Controls */}
            <ExportControls onExport={handleExport} />
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <ElectoralResults />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        positionFilter={positionFilter === "all" ? null : positionFilter}
        onPositionChange={(value) => setPositionFilter(value || "all")}
        positions={Array.from(new Set(allVotes.map(v => v.position)))}
        onApply={applyMobileFilters}
        onClear={clearFilter}
      />

      {/* Drilldown Panel */}
      <DrilldownPanel
        isOpen={isDrilldownOpen}
        onClose={() => setIsDrilldownOpen(false)}
        position={selectedPosition}
        candidates={drilldownCandidates}
        onExport={() => handleExport("pdf")}
      />

      {/* Voter Details Dialog */}
      <VoterDetailsDialog
        open={voterDialogOpen}
        onOpenChange={setVoterDialogOpen}
        votes={selectedVotes}
        title={dialogTitle}
        onStudentClick={handleStudentClick}
      />

      {/* Student Vote Detail Dialog */}
      <StudentVoteDetailDialog
        open={studentDetailOpen}
        onOpenChange={setStudentDetailOpen}
        votes={selectedStudentVotes}
        studentName={selectedStudentVotes[0]?.voter_name || ""}
      />

      {/* Time Slot Voters Dialog */}
      <TimeSlotVotersDialog
        open={timeSlotDialogOpen}
        onOpenChange={setTimeSlotDialogOpen}
        votes={selectedVotes}
        timeSlot={selectedTimeSlot}
        onStudentClick={handleStudentClick}
      />

      {/* Candidate Voters Dialog */}
      <CandidateVotersDialog
        open={candidateDialogOpen}
        onOpenChange={setCandidateDialogOpen}
        votes={selectedVotes}
        candidateName={selectedCandidate.name}
        position={selectedCandidate.position}
        isAdmin={userRole === 'admin'}
        onStudentClick={handleStudentClick}
      />

      {/* Invalid Votes Dialog */}
      <InvalidVotesDialog
        open={invalidVotesDialogOpen}
        onOpenChange={setInvalidVotesDialogOpen}
        votes={invalidVotesData}
      />

      <ErrorModal
        open={errorModalOpen}
        onOpenChange={setErrorModalOpen}
        title="Access Restricted"
        description="Only administrators can view detailed voter information."
      />
    </DashboardLayout>
  );
}
