import { useState, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in-up">
      <Card className="max-w-2xl mx-auto p-6 bg-background/95 backdrop-blur-sm border-border shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Cookie Notice</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          By logging in to the school portal, you agree to the use of cookies. 
          You can find details on how we use cookies in our{" "}
          <Link to="/cookies" className="text-primary hover:underline">
            Cookie Policy
          </Link>.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleAccept} className="flex-1">
            Accept Cookies
          </Button>
          <Button onClick={handleDecline} variant="outline" className="flex-1">
            Decline
          </Button>
        </div>
      </Card>
    </div>
  );
}