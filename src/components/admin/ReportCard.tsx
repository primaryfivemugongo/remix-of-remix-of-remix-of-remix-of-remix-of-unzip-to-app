import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText } from "lucide-react";

interface Report {
  id: number;
  name: string;
  description: string;
  type: string;
  lastGenerated: string;
  format: string;
  status: string;
}

interface ReportCardProps {
  report: Report;
  getStatusColor: (status: string) => string;
  getTypeIcon: (type: string) => React.ReactNode;
}

export function ReportCard({ report, getStatusColor, getTypeIcon }: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-muted shrink-0">
            {getTypeIcon(report.type)}
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">
                    {report.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {report.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {report.description}
                </p>
              </div>
              <Badge className={`${getStatusColor(report.status)} shrink-0`}>
                {report.status}
              </Badge>
            </div>
            
            {/* Details */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{report.lastGenerated}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{report.format}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 pt-1">
              {report.status === 'ready' && (
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              )}
              <Button size="sm" variant="outline" className="flex-1">
                {report.status === 'ready' ? 'Regenerate' : 'Generate'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}