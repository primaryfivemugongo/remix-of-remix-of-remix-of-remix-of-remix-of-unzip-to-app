import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./ChatHeader";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Hey! How are you doing?",
    timestamp: "2:25 PM",
    isSent: false
  },
  {
    id: "2",
    text: "I'm doing great! Just working on some new projects. How about you?",
    timestamp: "2:26 PM",
    isSent: true,
    status: "read"
  },
  {
    id: "3",
    text: "That sounds awesome! I'd love to hear more about them sometime",
    timestamp: "2:27 PM",
    isSent: false
  },
  {
    id: "4",
    text: "Absolutely! Maybe we can grab coffee next week and I'll show you what I've been working on",
    timestamp: "2:28 PM",
    isSent: true,
    status: "delivered"
  },
  {
    id: "5",
    text: "Perfect! I'm free Tuesday or Wednesday afternoon",
    timestamp: "2:29 PM",
    isSent: false
  },
  {
    id: "6",
    text: "Tuesday works for me! Let's meet at that new coffee place downtown",
    timestamp: "2:30 PM",
    isSent: true,
    status: "sent"
  }
];

interface ChatAreaProps {
  selectedChatId?: string;
}

export function ChatArea({ selectedChatId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      isSent: true,
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  if (!selectedChatId) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center bg-chat-background">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.4 0-2.72-.35-3.88-.97L7 19.5l.47-1.12C6.65 17.22 6 15.66 6 14c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Chat</h3>
            <p className="text-muted-foreground">Select a conversation from the sidebar to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader chatId={selectedChatId} />
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-chat-background">
        <div className="p-4 space-y-1">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}