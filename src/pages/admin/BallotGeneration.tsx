import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalCard } from "@/components/ui/professional-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Vote, Users, Loader2, Eye, Download } from "lucide-react";
import { BallotContainer } from "@/components/electoral/ballot";
import jsPDF from "jspdf";
import { generateBallotPDF } from "@/utils/pdfUtils";

interface Candidate {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
  class: string;
  stream: string;
}

interface Position {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
}

export default function BallotGeneration() {
  const navigate = useNavigate();
  const { userName, photoUrl } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [showBallotPreview, setShowBallotPreview] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  useEffect(() => {
    fetchApprovedCandidates();
  }, []);

  const fetchApprovedCandidates = async () => {
    try {
      setLoading(true);

      // Fetch confirmed candidates from electoral_applications
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('electoral_applications')
        .select('*')
        .eq('status', 'confirmed')
        .order('student_name');

      if (candidatesError) throw candidatesError;

      if (!candidatesData || candidatesData.length === 0) {
        toast({
          title: "No Approved Candidates",
          description: "There are no approved candidates yet. Please approve applications first.",
          variant: "destructive"
        });
        setPositions([]);
        return;
      }

      // Group candidates by position
      const positionsMap = new Map<string, Candidate[]>();
      
      candidatesData.forEach(app => {
        const positionTitle = app.position || 'Unknown Position';
        
        // Manually set photos for specific candidates
        let photo = app.student_photo;
        const name = app.student_name?.toUpperCase() || '';
        
        if (name.includes('JANAT') || name.includes('KALIBBALA')) {
          photo = '/janat.jpg';
        } else if (name.includes('SHANNAH') || name.includes('NAKASUJJA')) {
          photo = '/shannah.jpg';
        }
        
        const candidate: Candidate = {
          id: app.id!,
          name: app.student_name!,
          email: app.student_email!,
          photo: photo,
          class: app.class_name!,
          stream: app.stream_name!
        };
        
        if (!positionsMap.has(positionTitle)) {
          positionsMap.set(positionTitle, []);
        }
        positionsMap.get(positionTitle)!.push(candidate);
      });

      // Convert map to positions array
      const positionsWithCandidates: Position[] = Array.from(positionsMap.entries()).map(([title, candidates]) => ({
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        title: title.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: '',
        candidates
      }));

      setPositions(positionsWithCandidates);

      toast({
        title: "Candidates Loaded",
        description: `Loaded ${candidatesData.length} approved candidates from ${positionsWithCandidates.length} positions.`
      });
    } catch (error) {
      console.error('Error fetching approved candidates:', error);
      toast({
        title: "Error",
        description: "Failed to load approved candidates",
        variant: "destructive"
      });
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVotePosition = async (positionId: string, candidateId: string) => {
    // Mock function for preview - no actual voting
    return Promise.resolve();
  };

  const handleVoteComplete = (votes: Record<string, string>) => {
    // Mock function for preview
    setShowBallotPreview(false);
  };

  const generatePDFBallots = async () => {
    try {
      setGeneratingPDF(true);
      const ballotPositions = positions
        .filter((p) => p.candidates.length > 0)
        .map((p) => ({
          title: p.title,
          candidates: p.candidates.map((c) => ({
            id: c.id,
            name: c.name,
            class: c.class,
            stream: c.stream,
            photo: c.photo || null,
          })),
        }));

      const doc = await generateBallotPDF(ballotPositions, 'Official Ballot Paper', 3);
      doc.save(`ballots-${new Date().toISOString().split('T')[0]}.pdf`);

      const totalBallots = ballotPositions.length * 3;
      toast({
        title: 'PDF Generated',
        description: `Generated ${ballotPositions.length} pages with ${totalBallots} ballots (3 per position)`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF ballots',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const totalCandidates = positions.reduce((sum, pos) => sum + pos.candidates.length, 0);

  if (showBallotPreview) {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowBallotPreview(false)}
          className="absolute top-4 left-4 z-50"
          variant="secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Close Preview
        </Button>
        <BallotContainer
          positions={positions.filter(p => p.candidates.length > 0)}
          onVotePosition={handleVotePosition}
          onVoteComplete={handleVoteComplete}
        />
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole="admin"
      userName={userName}
      photoUrl={photoUrl}
      onLogout={handleLogout}
    >
      <div className="w-full min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="space-y-6">
            {/* Header */}
            <ProfessionalCard variant="elevated" className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/electoral/applications')}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Vote className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          Ballot Generation
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                          Preview and generate ballots for approved candidates
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowBallotPreview(true)}
                        disabled={totalCandidates === 0}
                        size="lg"
                        className="gap-2"
                        variant="secondary"
                      >
                        <Eye className="h-5 w-5" />
                        Preview Ballot
                      </Button>
                      <Button
                        onClick={generatePDFBallots}
                        disabled={totalCandidates === 0 || generatingPDF}
                        size="lg"
                        className="gap-2"
                      >
                        {generatingPDF ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Generating Ballots...
                          </>
                        ) : (
                          <>
                            <Download className="h-5 w-5" />
                            Generate PDF Ballots
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </ProfessionalCard>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfessionalCard variant="elevated">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Positions</p>
                      <p className="text-2xl font-bold">{positions.length}</p>
                    </div>
                    <Vote className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </ProfessionalCard>

              <ProfessionalCard variant="elevated">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved Candidates</p>
                      <p className="text-2xl font-bold">{totalCandidates}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </ProfessionalCard>
            </div>

            {/* Positions and Candidates */}
            {loading ? (
              <div className="flex items-center justify-center min-h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {positions.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Positions Available</h3>
                      <p className="text-muted-foreground">
                        No electoral positions have been created yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  positions.map((position) => (
                    <ProfessionalCard key={position.id} variant="bordered">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{position.title}</CardTitle>
                            {position.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {position.description}
                              </p>
                            )}
                          </div>
                          <Badge variant={position.candidates.length > 0 ? "default" : "secondary"}>
                            {position.candidates.length} {position.candidates.length === 1 ? 'Candidate' : 'Candidates'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {position.candidates.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No approved candidates for this position</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {position.candidates.map((candidate) => (
                              <div
                                key={candidate.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start gap-3">
                                  {candidate.photo ? (
                                    <img
                                      src={candidate.photo}
                                      alt={candidate.name}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Users className="h-6 w-6 text-primary" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{candidate.name}</h4>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {candidate.class} - {candidate.stream}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </ProfessionalCard>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
