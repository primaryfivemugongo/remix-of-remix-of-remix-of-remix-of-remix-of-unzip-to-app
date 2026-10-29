import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@/types/user";

interface FeedItem {
  id: string;
  voterName: string;
  position: string;
  time: string;
}

interface LiveFeedProps {
  votes?: Array<{ voter_name: string; position: string; voted_at: string }>;
  userRole?: UserRole | null;
}

export const LiveFeed = ({ votes = [], userRole }: LiveFeedProps) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Transform votes into feed items
    const items = votes.slice(0, 8).map((vote, index) => ({
      id: `${vote.voted_at}-${index}`,
      voterName: userRole === 'admin' ? vote.voter_name : 'Someone',
      position: vote.position,
      time: new Date(vote.voted_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
    setFeedItems(items);
  }, [votes, userRole]);

  return (
    <Card className="p-5 h-full">
      <Badge className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mb-4 gap-2">
        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        LIVE FEED
      </Badge>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {feedItems.length > 0 ? (
            feedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 border-l-4 border-green-500 bg-secondary rounded-md animate-fade-in"
              >
                <div className="font-semibold text-foreground text-sm">
                  {item.voterName}
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  Voted for {item.position}
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  {item.time}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No recent voting activity
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
