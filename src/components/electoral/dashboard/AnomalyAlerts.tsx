import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Anomaly {
  id: string;
  type: "duplicate" | "spike" | "suspicious";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  affectedCount: number;
}

interface AnomalyAlertsProps {
  anomalies: Anomaly[];
  onExport: (anomalyId: string) => void;
}

export function AnomalyAlerts({ anomalies, onExport }: AnomalyAlertsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const severityConfig = {
    low: { color: "text-muted-foreground", bg: "bg-muted" },
    medium: { color: "text-warning", bg: "bg-warning/10" },
    high: { color: "text-destructive", bg: "bg-destructive/10" }
  };

  const iconMap = {
    duplicate: Users,
    spike: TrendingUp,
    suspicious: AlertTriangle
  };

  if (anomalies.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Anomaly Alerts</CardTitle>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning text-xs font-bold text-warning-foreground">
                {anomalies.length}
              </span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-4 space-y-3">
              {anomalies.map((anomaly) => {
                const Icon = iconMap[anomaly.type];
                const config = severityConfig[anomaly.severity];
                
                return (
                  <Alert key={anomaly.id} className={config.bg}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                    <AlertTitle className={config.color}>{anomaly.title}</AlertTitle>
                    <AlertDescription>
                      <p className="text-sm mb-2">{anomaly.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Affected: {anomaly.affectedCount} {anomaly.affectedCount === 1 ? 'record' : 'records'}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onExport(anomaly.id)}
                        >
                          Export Details
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}
