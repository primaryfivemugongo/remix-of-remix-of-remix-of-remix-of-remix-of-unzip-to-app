import { cn } from "@/lib/utils";
import { CandidateOption } from "./CandidateOption";
import { AlertTriangle } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  photo?: string | null;
  class: string;
  stream: string;
}

interface PositionBallotProps {
  position: {
    id: string;
    title: string;
    candidates: Candidate[];
  };
  positionNumber: number;
  totalPositions: number;
  selectedCandidateId?: string;
  isLocked: boolean;
  isActive: boolean;
  isExiting: boolean;
  onSelectCandidate: (candidateId: string) => void;
}

export function PositionBallot({
  position,
  positionNumber,
  totalPositions,
  selectedCandidateId,
  isLocked,
  isActive,
  isExiting,
  onSelectCandidate
}: PositionBallotProps) {
  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        !isActive && "hidden opacity-0 translate-x-[100px]",
        isActive && "block opacity-100 translate-x-0 animate-in slide-in-from-right",
        isExiting && "opacity-0 -translate-x-[100px]"
      )}
    >
      {/* Position Info */}
      <div className="text-center mb-9 pb-6 border-b-2 border-[#2c3e50]">
        <div 
          className="inline-block bg-[#2c3e50] text-white px-5 py-2 rounded-[20px] text-sm mb-4 tracking-wide"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          Position {positionNumber} of {totalPositions}
        </div>
        <h2 
          className="text-2xl md:text-[2em] font-bold text-[#1a1a1a] mb-2 uppercase tracking-wide"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {position.title}
        </h2>
        <p 
          className="text-base md:text-[1em] text-[#4a4a4a] italic"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          (Vote for ONE)
        </p>
      </div>

      {/* Warning Notice */}
      <div className="bg-[#fff3cd] border-2 border-[#ffc107] p-4 mb-6 text-center">
        <div 
          className="text-[#856404] font-bold"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          ⚠️ WARNING: Once you mark your choice, it CANNOT be changed!
        </div>
      </div>

      {/* Candidates List */}
      <div className="mt-8">
        {position.candidates.map(candidate => (
          <CandidateOption
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedCandidateId === candidate.id}
            isLocked={isLocked}
            onSelect={() => onSelectCandidate(candidate.id)}
          />
        ))}
      </div>
    </div>
  );
}
