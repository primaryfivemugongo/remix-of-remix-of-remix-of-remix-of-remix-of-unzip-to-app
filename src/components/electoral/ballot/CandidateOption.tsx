import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CandidateOptionProps {
  candidate: {
    id: string;
    name: string;
    photo?: string | null;
    class: string;
    stream: string;
  };
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
}

export function CandidateOption({ 
  candidate, 
  isSelected, 
  isLocked, 
  onSelect 
}: CandidateOptionProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      onClick={!isLocked ? onSelect : undefined}
      className={cn(
        "group flex items-center p-5 mb-4 border-2 border-[#2c3e50] bg-white transition-all duration-300 relative",
        !isLocked && "cursor-pointer hover:bg-[#f5f3ed] hover:translate-x-[5px] hover:shadow-[-5px_5px_0_#2c3e50]",
        isSelected && "bg-[#f5f3ed] border-[#2c3e50] shadow-[-5px_5px_0_#2c3e50]",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
      animate={isSelected ? {
        x: [0, 8, 5],
        transition: { duration: 0.5, times: [0, 0.5, 1] }
      } : {}}
    >
      <motion.div 
        className={cn(
          "h-[60px] w-[60px] min-w-[60px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] border-[3px] border-[#2c3e50] flex items-center justify-center text-2xl transition-all duration-300",
          isSelected && "border-[#2c3e50] shadow-[0_0_0_3px_rgba(44,62,80,0.2)]",
          !isLocked && "group-hover:scale-105 group-hover:border-[#2c3e50]"
        )}
        animate={isSelected ? {
          scale: [1, 1.05, 1],
          transition: { duration: 0.3 }
        } : {}}
      >
        {candidate.photo ? (
          <img src={candidate.photo} alt={candidate.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-white font-bold text-2xl">{getInitials(candidate.name)}</span>
        )}
      </motion.div>

      <div className="flex-1 ml-5">
        <div className="text-lg md:text-xl font-bold text-[#1a1a1a] mb-1">
          {candidate.name}
        </div>
        <div className="text-sm md:text-base text-[#4a4a4a] mb-2">
          {candidate.class} - {candidate.stream}
        </div>
      </div>

      <motion.div 
        className={cn(
          "w-10 h-10 min-w-[40px] border-[3px] border-[#2c3e50] bg-white ml-5 flex items-center justify-center pointer-events-none",
          isSelected && "bg-[#2c3e50] border-[#2c3e50]"
        )}
        animate={isSelected ? {
          scale: [1, 1.15, 1],
          transition: { duration: 0.5 }
        } : {}}
      >
        <motion.span 
          className="text-white text-3xl font-bold"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={isSelected ? {
            opacity: 1,
            scale: [0, 1.2, 0.9, 1],
            rotate: [-180, 10, -5, 0],
            transition: {
              duration: 0.6,
              times: [0, 0.6, 0.8, 1],
              ease: [0.34, 1.56, 0.64, 1]
            }
          } : {
            opacity: 0,
            scale: 0,
            rotate: -180
          }}
        >
          ✓
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
