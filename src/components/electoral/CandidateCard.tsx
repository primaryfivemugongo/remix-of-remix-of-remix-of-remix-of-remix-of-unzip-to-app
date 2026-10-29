import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhotoDialog } from "@/components/ui/photo-dialog";
import { Trophy, TrendingUp, Award, Plus } from "lucide-react";
import { useState } from "react";
import { PhysicalVotesModal } from "./PhysicalVotesModal";
import { useAuth } from "@/hooks/useAuth";

interface CandidateCardProps {
  id: string;
  name: string;
  photo: string | null;
  position: string;
  votes: number;
  rank: number;
  className: string;
  stream: string;
  onClick: () => void;
}

export function CandidateCard({
  id,
  name,
  photo,
  position,
  votes,
  rank,
  className,
  stream,
  onClick
}: CandidateCardProps) {
  const [showPhysicalVotes, setShowPhysicalVotes] = useState(false);
  const { userRole } = useAuth();
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-none">
          <Trophy className="h-3 w-3 mr-1" />
          1st Place
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-none">
          <Award className="h-3 w-3 mr-1" />
          2nd Place
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none">
          <Award className="h-3 w-3 mr-1" />
          3rd Place
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        #{rank}
      </Badge>
    );
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-3">
          {/* Photo */}
          <div className="relative">
            <PhotoDialog
              photoUrl={photo}
              userName={name}
              size="h-24 w-24 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
            />
            <div className="absolute -top-2 -right-2">
              {getRankBadge()}
            </div>
          </div>

          {/* Name */}
          <div className="text-center space-y-1 w-full">
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {className} - {stream}
            </p>
          </div>

          {/* Position Badge */}
          <Badge variant="secondary" className="w-full justify-center text-center">
            {position}
          </Badge>

          {/* Votes */}
          <div className="flex items-center justify-center gap-2 w-full pt-2 border-t border-border">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-2xl font-bold text-primary">{votes}</span>
            <span className="text-sm text-muted-foreground">votes</span>
          </div>

          {/* Add Physical Votes Button (Admin Only) */}
          {userRole === 'admin' && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowPhysicalVotes(true);
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Physical Votes
            </Button>
          )}
        </div>
      </CardContent>

      <PhysicalVotesModal
        open={showPhysicalVotes}
        onOpenChange={setShowPhysicalVotes}
        candidateId={id}
        candidateName={name}
        position={position}
        onSuccess={() => window.location.reload()}
      />
    </Card>
  );
}
