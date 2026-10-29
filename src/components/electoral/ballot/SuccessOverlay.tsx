import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router-compat";

interface SuccessOverlayProps {
  isActive: boolean;
}

export function SuccessOverlay({ isActive }: SuccessOverlayProps) {
  const navigate = useNavigate();
  
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-gray-900 p-12 rounded-lg text-center max-w-[500px] mx-4 animate-in zoom-in duration-500 shadow-2xl"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        <div className="text-[5em] mb-5 animate-bounce">
          🎉
        </div>
        <h2 className="text-[2em] font-bold text-[#1a1a1a] dark:text-white mb-4">
          Vote Submitted!
        </h2>
        <p className="text-[#4a4a4a] dark:text-gray-300 leading-[1.6] text-[1.1em] mb-8">
          Thank you for participating in the Student Council Elections. Your vote has been recorded and will be counted!
        </p>
        
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate('/student/electoral')}
            className="px-8 py-6 text-lg font-bold uppercase tracking-wider bg-[#667eea] hover:bg-[#5568d3] text-white"
          >
            View Live Results
          </Button>
          
          <Button
            onClick={() => navigate('/student')}
            variant="outline"
            className="px-8 py-4 text-base font-semibold"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
