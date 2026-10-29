import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ElectoralResults = () => {
  const [pages, setPages] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [candidatesData, setCandidatesData] = useState([]);
  const [voteChanges, setVoteChanges] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentTransition, setCurrentTransition] = useState({ in: 'slideInRight', out: 'slideOutLeft' });
  const autoScrollTimerRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const pageContainerRef = useRef(null);

  // Load real electoral data from JSON file and database
  useEffect(() => {
    const loadElectoralData = async () => {
      setIsLoading(true);
      
      // Try fetching votes from JSON; fallback to DB if missing/invalid
      let votes: any[] = [];
      try {
        const votesUrl = '/electoral_votes.json';
        const votesResponse = await fetch(votesUrl, { cache: 'no-store' });
        if (!votesResponse.ok) throw new Error(`Failed to load ${votesUrl} (${votesResponse.status})`);
        const contentType = votesResponse.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error(`Invalid content-type: ${contentType}`);
        const allVotes = await votesResponse.json();
        votes = Array.isArray(allVotes) ? allVotes : [];
      } catch (err) {
        console.warn('electoral-results: Falling back to DB votes due to JSON issue:', err);
        const { data: dbVotes, error: votesError } = await supabase
          .from('electoral_votes')
          .select('*')
          .eq('vote_status', 'valid')
          .limit(100000);
        if (votesError) {
          console.error('Failed to load votes from DB:', votesError);
          setIsLoading(false);
          return;
        }
        votes = dbVotes || [];
      }

      // Only count valid votes
      votes = votes.filter(vote => vote.vote_status === 'valid');
      
      // Fetch candidates from database
      const { data: candidates, error: candidatesError } = await supabase
        .from('electoral_applications')
        .select('*')
        .eq('status', 'confirmed')
        .limit(100000);
      
      if (candidatesError || !votes || !candidates) {
        setIsLoading(false);
        return;
      }

      // Group votes by position
      const positionVotes = {};
      votes.forEach(vote => {
        if (!positionVotes[vote.position]) {
          positionVotes[vote.position] = {};
        }
        if (!positionVotes[vote.position][vote.candidate_id]) {
          positionVotes[vote.position][vote.candidate_id] = 0;
        }
        positionVotes[vote.position][vote.candidate_id]++;
      });

      // Create candidate map
      const candidateMap = {};
      candidates.forEach(candidate => {
        candidateMap[candidate.id] = candidate;
      });

      // Hardcoded photo mapping for specific students
      const photoMapping: Record<string, string> = {};

      // Build pages data
      const pagesData = Object.entries(positionVotes).map(([position, candidateVoteCounts]) => {
        const candidatesForPosition = Object.entries(candidateVoteCounts)
          .filter(([candidateId]) => candidateMap[candidateId]) // Only include candidates that exist
          .map(([candidateId, voteCount]) => {
            const candidate = candidateMap[candidateId];
            const studentName = candidate.student_name.toUpperCase();
            
            // Check if student has a hardcoded photo
            let photo = candidate.student_photo;
            for (const [name, url] of Object.entries(photoMapping)) {
              if (studentName.includes(name)) {
                photo = url;
                break;
              }
            }
            
            return {
              id: candidateId,
              name: candidate.student_name,
              party: position,
              votes: voteCount,
              photo: photo
            };
          })
          .sort((a, b) => b.votes - a.votes);

        return {
          title: position,
          candidates: candidatesForPosition
        };
      });

      setPages(pagesData);
      setCandidatesData(pagesData);
      setIsLoading(false);
    };

    loadElectoralData();

    // Set up real-time subscription for candidates only
    const channel = supabase
      .channel('electoral-results-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'electoral_applications' },
        (payload) => {
          console.log('Electoral applications changed:', payload);
          loadElectoralData();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for electoral results');
        }
        if (err) {
          console.error('❌ Subscription error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const transitions = [
    { in: 'slideInRight', out: 'slideOutLeft' },
    { in: 'slideInLeft', out: 'slideOutRight' },
    { in: 'bounceIn', out: 'bounceOut' },
    { in: 'flipInY', out: 'flipOutY' },
    { in: 'flipInX', out: 'flipOutX' },
    { in: 'zoomIn', out: 'zoomOut' },
    { in: 'swipeInUp', out: 'swipeOutDown' },
    { in: 'morphIn', out: 'morphOut' }
  ];


  const startAutoScroll = () => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
    autoScrollTimerRef.current = setInterval(() => {
      nextPage();
    }, 60000);
  };

  const resetAutoScroll = () => {
    startAutoScroll();
  };

  const nextPage = () => {
    const nextPageIndex = (currentPage + 1) % pages.length;
    goToPage(nextPageIndex);
  };

  const goToPage = (pageIndex) => {
    if (isTransitioning || pageIndex === currentPage) return;
    
    // Select random transition
    const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
    setCurrentTransition(randomTransition);
    
    setIsTransitioning(true);
    
    setCurrentPage(pageIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
    
    resetAutoScroll();
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndXRef.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchEndXRef.current < touchStartXRef.current - swipeThreshold) {
      nextPage();
    } else if (touchEndXRef.current > touchStartXRef.current + swipeThreshold) {
      const prevPage = (currentPage - 1 + pages.length) % pages.length;
      goToPage(prevPage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      const prevPage = (currentPage - 1 + pages.length) % pages.length;
      goToPage(prevPage);
    }
    if (e.key === 'ArrowRight') {
      nextPage();
    }
  };

  useEffect(() => {
    if (pages.length > 0) {
      startAutoScroll();
    }
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, pages]);

  const CandidateCard = ({ candidate, position, pageIndex }) => {
    const [displayVotes, setDisplayVotes] = useState(0);
    const animationRef = useRef(null);

    useEffect(() => {
      const startTime = Date.now();
      const duration = 1500;
      const startVotes = displayVotes;
      const endVotes = candidate.votes;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuad = progress * (2 - progress);
        const current = Math.floor(startVotes + ((endVotes - startVotes) * easeOutQuad));
        
        setDisplayVotes(current);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayVotes(endVotes);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [candidate.votes]);

    return (
      <div className={`candidate-card position-${position}`}>
        {position === 1 && <div className="crown-emoji">👑</div>}
        <div className="photo-container">
          <img src={candidate.photo} alt={candidate.name} />
        </div>
        <h3 className="candidate-name">{candidate.name}</h3>
        <p className="candidate-party">{candidate.party}</p>
        <div className="votes-display">
          <span className="votes-label">Total Votes:</span>
          <span className="votes-count">{displayVotes.toLocaleString()}</span>
        </div>
        {voteChanges[candidate.id] && (
          <div className="vote-change show">
            +{voteChanges[candidate.id].toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  if (isLoading || pages.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        color: 'hsl(var(--muted-foreground))'
      }}>
        <div style={{ textAlign: 'center' }}>
          {isLoading ? (
            <>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid hsl(var(--border))',
                borderTop: '3px solid hsl(var(--primary))',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p>Loading electoral results...</p>
            </>
          ) : (
            <p>No electoral data available yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={pageContainerRef}
      style={{ 
        margin: 0,
        boxSizing: 'border-box',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px',
        color: '#fff',
        overflowX: 'hidden',
        overflowY: 'auto'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          animation: fadeInDown 0.8s ease;
        }

        .header h1 {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          margin-bottom: 8px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header .post-name {
          font-size: clamp(0.9rem, 2.5vw, 1.2rem);
          opacity: 0.9;
          font-weight: 300;
        }

        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.2);
          padding: 6px 14px;
          border-radius: 20px;
          margin-top: 8px;
          font-size: 0.9rem;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #f5576c;
          border-radius: 50%;
          animation: livePulse 1.5s infinite;
        }

        .results-container {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          padding: 10px;
          padding-top: 30px;
        }

        .candidate-card {
          background: rgba(255,255,255,0.98);
          border-radius: 15px;
          padding: 15px 12px;
          padding-top: 25px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          transition: all 0.5s ease;
          position: relative;
          overflow: visible;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: center;
        }

        .candidate-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          border-radius: 15px 15px 0 0;
        }

        .candidate-card.position-1::before {
          background: linear-gradient(90deg, #FFD700, #FF6B35, #F7931E);
          animation: shimmer 3s ease-in-out infinite;
          background-size: 200% 100%;
        }

        .candidate-card.position-1 {
          background: linear-gradient(135deg, rgba(255,215,0,0.25) 0%, rgba(255,107,53,0.15) 50%, rgba(255,255,255,0.98) 100%);
          box-shadow: 0 10px 25px rgba(255,215,0,0.3), 0 0 15px rgba(255,107,53,0.2);
        }

        .candidate-card.position-2::before {
          background: linear-gradient(90deg, #4facfe, #00f2fe, #43e97b);
        }

        .candidate-card.position-2 {
          background: linear-gradient(135deg, rgba(79,172,254,0.25) 0%, rgba(0,242,254,0.15) 50%, rgba(255,255,255,0.98) 100%);
          box-shadow: 0 10px 25px rgba(79,172,254,0.3), 0 0 15px rgba(0,242,254,0.2);
        }

        .candidate-card.position-3::before {
          background: linear-gradient(90deg, #f093fb, #f5576c, #fa709a);
        }

        .candidate-card.position-3 {
          background: linear-gradient(135deg, rgba(240,147,251,0.25) 0%, rgba(245,87,108,0.15) 50%, rgba(255,255,255,0.98) 100%);
          box-shadow: 0 10px 25px rgba(240,147,251,0.3), 0 0 15px rgba(245,87,108,0.2);
        }

        .candidate-card.position-4::before,
        .candidate-card.position-5::before,
        .candidate-card.position-6::before {
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .candidate-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
        }

        .crown-emoji {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 2rem;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
          z-index: 10;
        }

        .photo-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #667eea;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          margin-bottom: 6px;
          transition: transform 0.3s ease;
          position: relative;
          flex-shrink: 0;
        }

        .candidate-card.position-1 .photo-container {
          border-color: #FFD700;
          box-shadow: 0 6px 15px rgba(255,215,0,0.4), 0 0 12px rgba(255,107,53,0.2);
        }

        .candidate-card.position-2 .photo-container {
          border-color: #4facfe;
          box-shadow: 0 6px 15px rgba(79,172,254,0.4), 0 0 12px rgba(0,242,254,0.2);
        }

        .candidate-card.position-3 .photo-container {
          border-color: #f093fb;
          box-shadow: 0 6px 15px rgba(240,147,251,0.4), 0 0 12px rgba(245,87,108,0.2);
        }

        .candidate-card:hover .photo-container {
          transform: scale(1.05);
        }

        .photo-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .candidate-name {
          font-size: 1rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 2px;
        }

        .candidate-party {
          font-size: 0.75rem;
          color: #718096;
          margin-bottom: 8px;
          font-style: italic;
        }

        .votes-display {
          background: rgba(102,126,234,0.15);
          padding: 8px 15px;
          border-radius: 12px;
          width: 100%;
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .candidate-card.position-1 .votes-display {
          background: linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(255,107,53,0.2) 100%);
          border: 2px solid rgba(255,215,0,0.4);
        }

        .candidate-card.position-2 .votes-display {
          background: linear-gradient(135deg, rgba(79,172,254,0.3) 0%, rgba(0,242,254,0.2) 100%);
          border: 2px solid rgba(79,172,254,0.4);
        }

        .candidate-card.position-3 .votes-display {
          background: linear-gradient(135deg, rgba(240,147,251,0.3) 0%, rgba(245,87,108,0.2) 100%);
          border: 2px solid rgba(240,147,251,0.4);
        }

        .votes-label {
          font-size: 0.7rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .votes-count {
          font-size: 1.2rem;
          font-weight: bold;
          color: #667eea;
          animation: countUp 0.5s ease;
        }

        .candidate-card.position-1 .votes-count {
          color: #FF6B35;
          text-shadow: 0 0 6px rgba(255,215,0,0.3);
        }

        .candidate-card.position-2 .votes-count {
          color: #00f2fe;
          text-shadow: 0 0 6px rgba(79,172,254,0.3);
        }

        .candidate-card.position-3 .votes-count {
          color: #f5576c;
          text-shadow: 0 0 6px rgba(240,147,251,0.3);
        }

        .vote-change {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          font-weight: bold;
          opacity: 0;
          pointer-events: none;
          color: #43e97b;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          z-index: 100;
        }

        .vote-change.show {
          animation: voteChangeAnim 1s ease;
        }

        .pagination {
          display: flex;
          gap: 12px;
          background: rgba(255,255,255,0.15);
          padding: 12px 20px;
          border-radius: 30px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          margin: 30px auto;
          max-width: fit-content;
        }

        .page-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          border: 2px solid transparent;
          color: #fff;
          font-weight: bold;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-btn:hover {
          background: rgba(255,255,255,0.5);
          transform: scale(1.1);
        }

        .page-btn.active {
          background: #fff;
          color: #667eea;
          border-color: #667eea;
          box-shadow: 0 4px 15px rgba(255,255,255,0.4);
          transform: scale(1.15);
        }

        @media (max-width: 900px) {
          .results-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .results-container {
            grid-template-columns: 1fr;
          }
          
          .page-btn {
            width: 35px;
            height: 35px;
            font-size: 0.8rem;
          }

          .pagination {
            gap: 8px;
            padding: 10px 15px;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }

        @keyframes countUp {
          from {
            transform: scale(1.3);
            opacity: 0.5;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes voteChangeAnim {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -70%) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100%) scale(1);
          }
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @keyframes shimmer {
          0%, 100% { 
            background-position: 0% 50%;
          }
          50% { 
            background-position: 100% 50%;
          }
        }

        .page-content {
          animation-duration: 0.8s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }

        .page-content.active {
          display: block;
        }
        
        .page-content.exiting {
          display: block;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-100%);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-50%);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounceOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          25% {
            transform: scale(0.95);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(0.3) translateY(50%);
          }
        }

        @keyframes flipInY {
          from {
            opacity: 0;
            transform: perspective(1000px) rotateY(90deg);
          }
          to {
            opacity: 1;
            transform: perspective(1000px) rotateY(0);
          }
        }

        @keyframes flipOutY {
          from {
            opacity: 1;
            transform: perspective(1000px) rotateY(0);
          }
          to {
            opacity: 0;
            transform: perspective(1000px) rotateY(-90deg);
          }
        }

        @keyframes flipInX {
          from {
            opacity: 0;
            transform: perspective(1000px) rotateX(90deg);
          }
          to {
            opacity: 1;
            transform: perspective(1000px) rotateX(0);
          }
        }

        @keyframes flipOutX {
          from {
            opacity: 1;
            transform: perspective(1000px) rotateX(0);
          }
          to {
            opacity: 0;
            transform: perspective(1000px) rotateX(-90deg);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes zoomOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.5);
          }
        }

        @keyframes swipeInUp {
          from {
            opacity: 0;
            transform: translateY(100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes swipeOutDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(100%) scale(0.9);
          }
        }

        @keyframes morphIn {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
            border-radius: 50%;
          }
          50% {
            transform: scale(1.1) rotate(-90deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
            border-radius: 0;
          }
        }

        @keyframes morphOut {
          0% {
            opacity: 1;
            transform: scale(1) rotate(0);
            border-radius: 0;
          }
          50% {
            transform: scale(1.1) rotate(90deg);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(180deg);
            border-radius: 50%;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>

      <div>
        {candidatesData.map((page, pageIndex) => {
          const sortedCandidates = [...page.candidates].sort((a, b) => b.votes - a.votes);
          const isActive = pageIndex === currentPage;
          const animationClass = isActive ? currentTransition.in : '';
          
          return (
            <div
              key={pageIndex}
              className={`page-content ${isActive ? 'active' : ''}`}
              style={{
                display: isActive ? 'block' : 'none',
                animationName: animationClass
              }}
            >
              <div className="header">
                <h1>🗳️ Live Electoral Results</h1>
                <p className="post-name">{page.title}</p>
                <div className="live-indicator">
                  <span className="live-dot"></span>
                  <span>LIVE</span>
                </div>
              </div>
              <div className="results-container">
                {sortedCandidates.map((candidate, index) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    position={index + 1}
                    pageIndex={pageIndex}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pagination">
        {pages.map((_, index) => (
          <button
            key={index}
            className={`page-btn ${index === currentPage ? 'active' : ''}`}
            onClick={() => goToPage(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ElectoralResults;