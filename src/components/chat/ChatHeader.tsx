import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  chatId?: string;
}

export function ChatHeader({ chatId }: ChatHeaderProps) {
  const chatInfo = {
    name: "Sarah Johnson",
    status: "online",
    avatar: ""
  };

  if (!chatId) {
    return (
      <div className="h-16 border-b border-border bg-card flex items-center justify-center">
        <p className="text-muted-foreground">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={chatInfo.avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {chatInfo.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-card-foreground">{chatInfo.name}</h2>
          <p className="text-sm text-muted-foreground">{chatInfo.status}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <Video className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}