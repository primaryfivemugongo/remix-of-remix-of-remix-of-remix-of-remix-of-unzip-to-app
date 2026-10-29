import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote, Eye, Edit, Image, FileText } from "lucide-react";

interface QuoteData {
  id: number;
  text: string;
  author: string;
  category: string;
  source: 'text' | 'image';
  imageUrl?: string;
  status: 'active' | 'pending' | 'archived';
}

interface QuoteCardProps {
  quote: QuoteData;
  getStatusColor: (status: string) => string;
}

export function QuoteCard({ quote, getStatusColor }: QuoteCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-muted shrink-0">
            {quote.source === 'image' ? (
              <Image className="h-5 w-5" />
            ) : (
              <Quote className="h-5 w-5" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <blockquote className="font-medium text-foreground italic text-sm leading-relaxed">
                  "{quote.text}"
                </blockquote>
                <p className="text-sm text-muted-foreground mt-2">
                  — {quote.author}
                </p>
              </div>
              <Badge className={`${getStatusColor(quote.status)} shrink-0`}>
                {quote.status}
              </Badge>
            </div>
            
            {/* Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {quote.category}
                </Badge>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  {quote.source === 'image' ? (
                    <>
                      <Image className="h-3 w-3" />
                      Photo Quote
                    </>
                  ) : (
                    <>
                      <FileText className="h-3 w-3" />
                      Text Quote
                    </>
                  )}
                </Badge>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}