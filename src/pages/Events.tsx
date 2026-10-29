import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";
import { EventCard } from "@/components/events/EventCard";
import { VideoModal } from "@/components/elearning/VideoModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EventVideo, eventData, eventCategories } from "@/data/eventData";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const Events = () => {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  const categories = ["all", ...Object.keys(eventCategories)];

  const filteredEvents = useMemo(() => {
    let filtered = [...eventData];

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, itemsPerPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleEventClick = (event: EventVideo) => {
    setSelectedEvent(event as any);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout 
      userRole={userRole || "student"} 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="w-full min-w-0 space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-4">
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text px-2">🎬 School Events 🎉</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium px-2">Watch memorable moments from our school!</p>
        </div>

        <div className="w-full min-w-0 max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
            <Input
              type="text"
              placeholder="🔍 Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-w-0 pl-11 sm:pl-14 pr-4 h-12 sm:h-14 lg:h-16 text-base sm:text-lg rounded-2xl border-2 focus:border-primary shadow-lg"
            />
          </div>
        </div>

        <div className="w-full min-w-0 max-w-5xl mx-auto space-y-3 sm:space-y-4">
          <p className="text-center text-base sm:text-lg font-semibold text-foreground">Filter by Category:</p>
          <div className="w-full min-w-0 max-w-md mx-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full min-w-0 h-12 sm:h-14 text-base sm:text-lg rounded-xl border-2 shadow-md">
                <SelectValue placeholder="🎨 Pick Category" />
              </SelectTrigger>
              <SelectContent className="text-sm sm:text-base">
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-sm sm:text-base py-2 sm:py-3">
                    {cat === "all" ? "🎨 All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(selectedCategory !== "all" || searchQuery) && (
            <div className="text-center">
              <Button 
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                  toast.success("Filters cleared!");
                }}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-xl px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-semibold"
              >
                🔄 Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {(searchQuery || selectedCategory !== "all") && (
          <div className="text-center px-2">
            <div className="inline-block bg-primary/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-primary/20">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-primary">
                🎉 Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} for you!
              </p>
            </div>
          </div>
        )}

        {paginatedEvents.length > 0 ? (
          <div className="w-full min-w-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 pb-6 sm:pb-8">
            {paginatedEvents.map((event, index) => (
              <EventCard 
                key={`${event.src}-${index}`}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-card to-card/50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-border shadow-lg mx-2">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">😕</div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-card-foreground mb-2 px-2">Oops! No events found</p>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-6 px-2">Try searching for something else or change your filters</p>
            <Button 
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              size="lg"
              className="w-auto rounded-xl px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-semibold"
            >
              🔄 Show All Events
            </Button>
          </div>
        )}

        {filteredEvents.length > 0 && totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 pt-6 sm:pt-8 pb-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                size="lg"
                className="rounded-xl px-3 sm:px-6 h-11 sm:h-14 text-sm sm:text-base font-bold gap-1 sm:gap-2"
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="bg-primary text-primary-foreground px-4 sm:px-8 py-2 sm:py-3 rounded-xl shadow-lg">
                <span className="text-sm sm:text-base lg:text-lg font-bold whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                size="lg"
                className="rounded-xl px-3 sm:px-6 h-11 sm:h-14 text-sm sm:text-base font-bold gap-1 sm:gap-2"
                variant="outline"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger className="w-full sm:w-48 max-w-[200px] h-11 sm:h-12 text-sm sm:text-base rounded-xl border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12" className="text-sm sm:text-base py-2 sm:py-3">🎬 Show 12</SelectItem>
                <SelectItem value="24" className="text-sm sm:text-base py-2 sm:py-3">🎬 Show 24</SelectItem>
                <SelectItem value="48" className="text-sm sm:text-base py-2 sm:py-3">🎬 Show 48</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <VideoModal 
          video={selectedEvent as any}
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Events;
