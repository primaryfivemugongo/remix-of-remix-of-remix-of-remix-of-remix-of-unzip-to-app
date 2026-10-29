import { cn } from "@/lib/utils";

interface BallotFooterProps {
  totalPositions: number;
  currentPosition: number;
  showSubmit?: boolean;
  onSubmit?: () => void;
}

export function BallotFooter({ 
  totalPositions, 
  currentPosition, 
  showSubmit,
  onSubmit 
}: BallotFooterProps) {
  return (
    <div className="px-6 py-6 md:px-8 md:py-6 bg-[#f5f3ed] border-t-2 border-[#2c3e50] flex justify-center items-center">
      <div className="flex gap-3">
        {Array.from({ length: totalPositions }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-full border-2 border-[#2c3e50] transition-all duration-300",
              index < currentPosition && "w-3 h-3 bg-[#2c3e50]",
              index === currentPosition && "w-4 h-4 bg-[#c9a961] border-[#c9a961] shadow-[0_0_0_3px_rgba(201,169,97,0.3)]",
              index > currentPosition && "w-3 h-3 bg-white"
            )}
          />
        ))}
      </div>
    </div>
  );
}
