import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical } from "lucide-react";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar?: string;
  unread?: number;
  online?: boolean;
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    lastMessage: "Hey! How are you doing?",
    timestamp: "2:30 PM",
    unread: 2,
    online: true
  },
  {
    id: "2",
    name: "Team Project",
    lastMessage: "The meeting is at 3 PM",
    timestamp: "1:45 PM",
    unread: 5
  },
  {
    id: "3",
    name: "Mike Chen",
    lastMessage: "Thanks for the help!",
    timestamp: "12:20 PM",
    online: true
  },
  {
    id: "4",
    name: "Family Group",
    lastMessage: "Mom: Don't forget dinner on Sunday",
    timestamp: "11:30 AM"
  },
  {
    id: "5",
    name: "Alex Rivera",
    lastMessage: "See you tomorrow 👋",
    timestamp: "Yesterday"
  }
];

interface ChatSidebarProps {
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}

export function ChatSidebar({ selectedChatId, onChatSelect }: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-chat-sidebar text-chat-sidebar-foreground">
      {/* Header */}
      <div className="p-4 border-b border-chat-sidebar-hover">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Chats</h1>
          <MoreVertical className="w-5 h-5 text-chat-sidebar-foreground/70 cursor-pointer hover:text-chat-sidebar-foreground" />
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-chat-sidebar-foreground/50" />
          <Input 
            placeholder="Search chats..." 
            className="pl-10 bg-chat-sidebar-hover border-0 text-chat-sidebar-foreground placeholder:text-chat-sidebar-foreground/50 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-chat-sidebar-hover ${
                selectedChatId === chat.id ? 'bg-chat-sidebar-hover' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {chat.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {chat.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-chat-sidebar"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-chat-sidebar-foreground truncate">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-chat-sidebar-foreground/60 flex-shrink-0">
                    {chat.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-chat-sidebar-foreground/70 truncate">
                    {chat.lastMessage}
                  </p>
                  {chat.unread && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}