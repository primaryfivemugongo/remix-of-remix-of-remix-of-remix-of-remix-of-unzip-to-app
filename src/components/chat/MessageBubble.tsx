import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex w-full mb-3",
      message.isSent ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] px-4 py-2 rounded-2xl shadow-sm",
        message.isSent 
          ? "bg-message-sent text-message-sent-foreground rounded-br-md" 
          : "bg-message-received text-message-received-foreground rounded-bl-md"
      )}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <div className={cn(
          "flex items-center gap-1 mt-1",
          message.isSent ? "justify-end" : "justify-start"
        )}>
          <span className={cn(
            "text-xs",
            message.isSent 
              ? "text-message-sent-foreground/70" 
              : "text-message-received-foreground/60"
          )}>
            {message.timestamp}
          </span>
          {message.isSent && (
            <div className="flex">
              <svg 
                className={cn(
                  "w-3 h-3",
                  message.status === 'read' ? "text-blue-400" : "text-message-sent-foreground/70"
                )} 
                viewBox="0 0 16 15" 
                fill="currentColor"
              >
                <path d="m0.5 7.5 3.5 3.5L12 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                {message.status === 'delivered' || message.status === 'read' ? (
                  <path d="m4.5 7.5 3.5 3.5L16 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                ) : null}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}