import { Video } from "@/types/video";
import { BookOpen, FlaskConical, Pencil, Globe, Church, Palette, Play } from "lucide-react";

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  "Maths": "from-blue-500 to-blue-700",
  "Science": "from-green-500 to-green-700",
  "English": "from-orange-500 to-orange-700",
  "Social Studies": "from-red-500 to-red-700",
  "Religious Education": "from-purple-500 to-purple-700",
  "Art & Craft": "from-pink-500 to-pink-700"
};

const categoryIcons: Record<string, any> = {
  "Maths": BookOpen,
  "Science": FlaskConical,
  "English": Pencil,
  "Social Studies": Globe,
  "Religious Education": Church,
  "Art & Craft": Palette
};

export function VideoCard({ video, onClick }: VideoCardProps) {
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.src}/hqdefault.jpg`;
  const gradientColor = categoryColors[video.category] || "from-gray-500 to-gray-700";
  const CategoryIcon = categoryIcons[video.category] || BookOpen;

  return (
    <div 
      className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 border-2 border-border hover:border-primary/50 group"
      onClick={onClick}
    >
      {/* Thumbnail with Play Overlay */}
      <div className="relative w-full pt-[56.25%] bg-muted">
        <img 
          src={thumbnailUrl}
          alt={video.title}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
            <Play className="w-10 h-10 text-primary fill-primary ml-1" />
          </div>
        </div>
        {/* Category Badge with Icon */}
        <div className={`absolute top-3 right-3 bg-gradient-to-r ${gradientColor} text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-2`}>
          <CategoryIcon className="w-4 h-4" />
          {video.category}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-card-foreground text-base mb-3 line-clamp-2 leading-relaxed">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg text-sm font-semibold text-primary border border-primary/20">
            📚 {video.class}
          </span>
          <span className="px-3 py-2 bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-lg text-sm font-semibold text-secondary-foreground border border-secondary/20 truncate flex-1 min-w-0">
            ✨ {video.topic}
          </span>
        </div>
      </div>
    </div>
  );
}
