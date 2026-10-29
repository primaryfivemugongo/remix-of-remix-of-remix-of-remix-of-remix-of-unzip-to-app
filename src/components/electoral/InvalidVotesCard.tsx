import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface InvalidVotesCardProps {
  count: number;
  onClick?: () => void;
  isAdmin: boolean;
  isLoading?: boolean;
}

export function InvalidVotesCard({ count, onClick, isAdmin, isLoading = false }: InvalidVotesCardProps) {
  const handleClick = () => {
    if (isAdmin && onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card 
        className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-red-200 dark:border-red-800 ${
          isAdmin ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''
        } transition-all duration-300`}
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Invalid Votes
            {!isAdmin && (
              <Badge variant="outline" className="ml-auto text-xs">View Only</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <motion.div 
                className="text-3xl font-bold text-red-800 dark:text-red-300"
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              >
                {count}
              </motion.div>
            )}
            <div className="text-xs text-red-600 dark:text-red-400">
              {count === 1 ? 'vote' : 'votes'}
            </div>
          </div>
          {isAdmin && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Click to view details
            </p>
          )}
          {!isAdmin && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Missing location data
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
