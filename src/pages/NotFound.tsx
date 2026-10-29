import { useLocation, useNavigate } from "@/lib/router-compat";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Cat } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const cat404Image = "https://raw.githubusercontent.com/Fresh-Teacher/glorious-gateway-65056-78561-35497/main/src/assets/cat-404.jpg";
const curiosityCatGif = "https://raw.githubusercontent.com/Fresh-Teacher/glorious-gateway-65056-78561-35497/main/src/assets/curiosity-cat.gif";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, photoUrl, userRole } = useAuth();

  const handleLogout = () => {
    navigate('/login');
  };

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <DashboardLayout 
      userRole={userRole} 
      userName={userName || ''} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
        {/* Animated 404 Text */}
        <div className="text-center mb-8">
          <div className="text-8xl md:text-9xl font-black text-primary animate-[pulse_2s_ease-in-out_infinite] mb-4">
            <span className="inline-block animate-[bounce_1s_ease-in-out_infinite] animation-delay-0">4</span>
            <span className="inline-block animate-[bounce_1s_ease-in-out_infinite] animation-delay-200">0</span>
            <span className="inline-block animate-[bounce_1s_ease-in-out_infinite] animation-delay-400">4</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            ERROR!
          </div>
        </div>

        {/* Images Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="animate-[scale-in_0.8s_ease-out] hover:animate-[bounce_0.5s_ease-in-out]">
            <img 
              src={cat404Image} 
              alt="Curious cat in trouble" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary shadow-lg hover:shadow-primary/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Fun Message */}
        <div className="max-w-3xl text-center animate-[fade-in_1s_ease-out_0.8s_both] mb-8">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Cat className="h-6 w-6 text-primary animate-[bounce_1s_ease-in-out_infinite]" />
              <h2 className="text-xl md:text-2xl font-bold text-card-foreground">
                Hey There, Curious Explorer! 
              </h2>
              <Cat className="h-6 w-6 text-primary animate-[bounce_1s_ease-in-out_infinite] animation-delay-500" />
            </div>
            
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground mb-4">
              A <span className="font-bold text-destructive">404 error</span> means the page you are looking for does not exist. 
              A <span className="font-bold text-destructive">404 error</span> can also mean that you were trying to play around with a page link.
            </p>
            <div className="animate-[fade-in_1s_ease-out_0.5s_both] flex justify-center mb-4">
            <img 
              src={curiosityCatGif} 
              alt="Curious cat animation" 
              className="w-40 h-40 md:w-48 md:h-48 rounded-xl object-cover border-4 border-destructive shadow-lg hover:shadow-destructive/50 transition-all duration-300"
            />
          </div>
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
              Remember: Curiosity killed the cat...
            </div>
            
            <div className="text-xl md:text-2xl font-bold text-destructive flex items-center justify-center gap-2">
              DON'T BE THAT CAT! 
              <span className="text-3xl animate-[bounce_0.5s_ease-in-out_infinite]">😹</span>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg inline-block">
              Lost path: <code className="font-mono text-destructive">{location.pathname}</code>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-[slide-in-right_0.8s_ease-out_1.2s_both]">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            size="lg"
            className="gap-2 hover-scale bg-card/80 backdrop-blur-sm border-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Previous Page
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            size="lg"
            className="gap-2 hover-scale bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25"
          >
            <Home className="h-5 w-5" />
            Return to Homepage
          </Button>
        </div>

        {/* Floating Animation Elements */}
        <div className="absolute top-20 left-10 animate-[bounce_3s_ease-in-out_infinite] opacity-20">
          <Cat className="h-8 w-8 text-primary" />
        </div>
        <div className="absolute top-32 right-16 animate-[bounce_3s_ease-in-out_infinite] animation-delay-1000 opacity-20">
          <Cat className="h-6 w-6 text-destructive" />
        </div>
        <div className="absolute bottom-20 left-20 animate-[bounce_3s_ease-in-out_infinite] animation-delay-2000 opacity-20">
          <Cat className="h-10 w-10 text-accent" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;