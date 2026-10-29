import { EventVideo } from "@/data/eventData";
import { Play } from "lucide-react";

interface EventCardProps {
  event: EventVideo;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  "Performances": "from-purple-500 to-pink-700",
  "Celebrations": "from-yellow-500 to-orange-700",
  "Educational": "from-blue-500 to-cyan-700",
  "School Events": "from-green-500 to-emerald-700",
  "Interviews": "from-red-500 to-rose-700"
};

export function EventCard({ event, onClick }: EventCardProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${event.src}/hqdefault.jpg`;
  const gradientColor = categoryColors[event.category] || "from-gray-500 to-gray-700";

  return (
    <div 
      className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 border-2 border-border hover:border-primary/50 group"
      onClick={onClick}
    >
      <div className="relative w-full pt-[56.25%] bg-muted overflow-hidden">
        <img 
          src={thumbnailUrl}
          alt={event.title}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
            <Play className="w-10 h-10 text-primary fill-primary ml-1" />
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-card-foreground text-base mb-3 line-clamp-2 leading-relaxed">
          {event.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-2 bg-gradient-to-r ${gradientColor} text-white rounded-lg text-sm font-bold shadow-md`}>
            {event.category}
          </span>
        </div>
      </div>
    </div>
  );
}
