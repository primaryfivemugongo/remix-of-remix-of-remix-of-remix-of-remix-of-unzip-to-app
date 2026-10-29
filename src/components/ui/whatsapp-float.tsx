import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppFloatProps {
  phoneNumber?: string;
  teacherName?: string;
  teacherAvatar?: string;
}

export function WhatsAppFloat({ 
  phoneNumber = "+256753616792", 
  teacherName = "School Office",
  teacherAvatar = "https://fresh-teacher.github.io/dp.jpeg"
}: WhatsAppFloatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const currentHour = new Date().getHours();
    let greetingMessage;
    
    if (currentHour >= 5 && currentHour < 12) {
      greetingMessage = "Good morning! How are you? ☀️";
    } else if (currentHour >= 12 && currentHour < 18) {
      greetingMessage = "Good afternoon! How are you? 🌤️";
    } else {
      greetingMessage = "Good evening! How are you? 🌙";
    }
    
    setGreeting(greetingMessage);
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const baseUrl = isMobile ? "whatsapp://send" : "https://web.whatsapp.com/send";
      const url = `${baseUrl}?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-[90px] right-[30px] w-[350px] bg-white rounded-[10px] shadow-lg z-[99] transition-all duration-300",
          "max-md:left-[5%] max-md:right-[5%] max-md:w-auto",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}
      >
        {/* Header */}
        <div className="bg-[#095e54] text-white p-5 rounded-t-[10px] relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-4 text-white text-2xl hover:opacity-70"
          >
            <X size={20} />
          </button>
          <div className="flex items-center">
            <img
              src={teacherAvatar}
              alt="Teacher"
              className="w-12 h-12 rounded-full mr-3 object-cover"
            />
            <div>
              <h3 className="font-semibold text-base mb-1">{teacherName}</h3>
              <p className="text-sm opacity-90">online</p>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="p-5 bg-[#1a1a1a] relative min-h-[120px]">
          {/* Message bubble */}
          <div className="flex items-start mb-4">
            <div className="bg-[#2d2d2d] rounded-[0_8px_8px_8px] p-3 max-w-[calc(100%-66px)] shadow-sm relative">
              <div 
                className="absolute top-0 left-[-12px] w-3 h-5"
                style={{
                  backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAmCAMAAADp2asXAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACQUExURUxpccPDw9ra2m9vbwAAAAAAADExMf///wAAABoaGk9PT7q6uqurqwsLCycnJz4+PtDQ0JycnIyMjPf3915eXvz8/E9PT/39/RMTE4CAgAAAAJqamv////////r6+u/v7yUlJeXl5f///5ycnOXl5XNzc/Hx8f///xUVFf///+zs7P///+bm5gAAAM7Ozv///2fVensAAAAvdFJOUwCow1cBCCnqAhNAnY0WIDW2f2/hSeo99g1lBYT87vDXG8/6d8oL4sgM5szrkgl660OiZwAAAHRJREFUKM/ty7cSggAABNFVUQFzwizmjPz/39k4YuFWtm55bw7eHR6ny63+alnswT3/rIDzUSC7CrAziPYCJCsB+gbVkgDtVIDh+DsE9OTBpCtAbSBAZSEQNgWIygJ0RgJMDWYNAdYbAeKtAHODlkHIv997AkLqIVOXVU84AAAAAElFTkSuQmCC)",
                  backgroundPosition: "50% 50%",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain"
                }}
              />
              <div className="text-sm font-bold text-gray-400 mb-1">{teacherName}</div>
              <div className="text-sm text-white">{greeting}</div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex bg-[#2d2d2d] border-t border-gray-600">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message"
            maxLength={120}
            className="flex-1 p-3 bg-transparent border-none outline-none resize-none h-12 text-sm text-white placeholder-gray-400"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            className="w-12 flex items-center justify-center bg-[#3d3d3d] hover:bg-[#4d4d4d] transition-colors"
          >
            <Send size={16} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-8 bg-white text-gray-700 px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 z-[98] font-medium"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" className="scale-110">
          <path 
            fill="#eceff1"
            d="M20.5 3.4A12.1 12.1 0 0012 0 12 12 0 001.7 17.8L0 24l6.3-1.7c2.8 1.5 5 1.4 5.8 1.5a12 12 0 008.4-20.3z" 
          />
          <path 
            fill="#4caf50"
            d="M12 21.8c-3.1 0-5.2-1.6-5.4-1.6l-3.7 1 1-3.7-.3-.4A9.9 9.9 0 012.1 12a10 10 0 0117-7 9.9 9.9 0 01-7 16.9z" 
          />
          <path 
            fill="#fafafa"
            d="M17.5 14.3c-.3 0-1.8-.8-2-.9-.7-.2-.5 0-1.7 1.3-.1.2-.3.2-.6.1s-1.3-.5-2.4-1.5a9 9 0 01-1.7-2c-.3-.6.4-.6 1-1.7l-.1-.5-1-2.2c-.2-.6-.4-.5-.6-.5-.6 0-1 0-1.4.3-1.6 1.8-1.2 3.6.2 5.6 2.7 3.5 4.2 4.2 6.8 5 .7.3 1.4.3 1.9.2.6 0 1.7-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4z" 
          />
        </svg>
        <span>Chat</span>
      </button>
    </>
  );
}