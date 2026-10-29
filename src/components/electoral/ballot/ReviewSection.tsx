import { Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Position {
  id: string;
  title: string;
  candidates: Array<{
    id: string;
    name: string;
  }>;
}

interface ReviewSectionProps {
  positions: Position[];
  selections: Record<string, string>;
  isActive: boolean;
}

export function ReviewSection({ positions, selections, isActive }: ReviewSectionProps) {
  if (!isActive) return null;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 
          className="text-3xl font-bold uppercase tracking-wider mb-4 text-[#1a1a1a]"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          Review Your Ballot
        </h2>
        <div 
          className="flex items-center justify-center gap-2 text-sm bg-[#d4edda] border-2 border-[#28a745] px-4 py-3 text-[#155724] font-bold"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          <Lock className="h-4 w-4" />
          <span>🔒 Your selections are permanently locked and cannot be changed</span>
        </div>
      </div>

      <ScrollArea className="max-h-[500px] pr-4">
        <div className="space-y-4">
          {positions.map(position => {
            const selectedCandidateId = selections[position.id];
            const candidate = position.candidates.find(c => c.id === selectedCandidateId);
            
            return (
              <div 
                key={position.id} 
                className="p-5 mb-4 border-2 border-[#2c3e50] bg-white flex justify-between items-center"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                <div>
                  <div className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wide mb-1">
                    {position.title}
                  </div>
                  <div className="text-xl font-bold text-[#1a1a1a]">
                    {candidate?.name || 'No selection'}
                  </div>
                </div>
                <Lock className="h-6 w-6 text-[#4a4a4a]" />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
