interface BallotHeaderProps {
  title?: string;
  subtitle?: string;
}

export function BallotHeader({ 
  title = "🗳️ Official Ballot", 
  subtitle = "Student Council Elections 2025" 
}: BallotHeaderProps) {
  return (
    <div className="bg-[#2c3e50] text-white px-6 py-6 md:px-8 md:py-8 text-center border-b-[3px] border-double border-[#c9a961]">
      <h1 
        className="text-2xl md:text-3xl font-bold mb-2 tracking-[2px] uppercase" 
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        {title}
      </h1>
      <p 
        className="text-base md:text-lg opacity-90 italic" 
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        {subtitle}
      </p>
    </div>
  );
}
