import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <Paperclip className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled}
            className="pr-12 py-3 rounded-full border-border focus-visible:ring-primary"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-accent"
          >
            <Smile className="w-5 h-5" />
          </Button>
        </div>

        <Button 
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}