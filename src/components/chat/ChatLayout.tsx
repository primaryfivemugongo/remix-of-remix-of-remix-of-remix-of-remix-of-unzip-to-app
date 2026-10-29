import { useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatArea } from "./ChatArea";

export function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState<string>();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex-shrink-0">
        <ChatSidebar 
          selectedChatId={selectedChatId}
          onChatSelect={setSelectedChatId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatArea selectedChatId={selectedChatId} />
      </div>
    </div>
  );
}