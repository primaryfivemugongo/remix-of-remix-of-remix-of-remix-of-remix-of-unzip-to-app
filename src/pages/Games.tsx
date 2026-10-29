import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Play, 
  Star,
  Timer,
  Target,
  Brain,
  Zap,
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

const games = [
  {
    id: 1,
    title: "Typing Wizard",
    description: "Master the magical art of typing with fun sound effects",
    category: "Educational",
    difficulty: "Medium",
    players: "1-4",
    duration: "15 min",
    rating: 4.5,
    icon: Brain,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    tags: ["mathematics", "quiz", "algebra", "geometry"]
  },
  {
    id: 2,
    title: "Word Puzzle Master",
    description: "Solve word puzzles and expand your vocabulary",
    category: "Language",
    difficulty: "Easy",
    players: "1-2",
    duration: "10 min",
    rating: 4.8,
    icon: Target,
    color: "bg-gradient-to-br from-green-500 to-green-600",
    tags: ["vocabulary", "words", "spelling", "puzzle"]
  },
  {
    id: 3,
    title: "Science Trivia",
    description: "Explore the wonders of science through fun trivia",
    category: "Science",
    difficulty: "Hard",
    players: "1-6",
    duration: "20 min",
    rating: 4.6,
    icon: Zap,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    tags: ["physics", "chemistry", "biology", "trivia"]
  },
  {
    id: 4,
    title: "Speed Memory",
    description: "Challenge your memory with this fast-paced game",
    category: "Memory",
    difficulty: "Medium",
    players: "1",
    duration: "5 min",
    rating: 4.3,
    icon: Timer,
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    tags: ["memory", "speed", "focus", "brain"]
  },
  {
    id: 5,
    title: "Geography Explorer",
    description: "Discover countries, capitals, and landmarks around the world",
    category: "Geography",
    difficulty: "Medium",
    players: "1-3",
    duration: "12 min",
    rating: 4.4,
    icon: Target,
    color: "bg-gradient-to-br from-teal-500 to-teal-600",
    tags: ["geography", "countries", "capitals", "world"]
  },
  {
    id: 6,
    title: "Logic Puzzles",
    description: "Train your logical thinking with challenging puzzles",
    category: "Logic",
    difficulty: "Hard",
    players: "1",
    duration: "25 min",
    rating: 4.7,
    icon: Brain,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    tags: ["logic", "puzzle", "reasoning", "critical thinking"]
  }
];

const categories = ["All", "Educational", "Language", "Science", "Memory", "Geography", "Logic"];

export default function Games() {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "difficulty">("name");

  const handleLogout = async () => {
    try {
      await signOut();
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  // Filter and search logic
  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === "All" || game.category === selectedCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "difficulty":
        const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
        return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
               difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
      default:
        return a.title.localeCompare(b.title);
    }
  });

  const handlePlayGame = (gameId: number) => {
    if (gameId === 1) {
      navigate("/games/typing-wizard");
    } else {
      toast.error("Game not available yet - redirecting to 404");
      navigate("/404");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout userRole={userRole || "student"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Educational Games</h1>
              <p className="text-muted-foreground">Learn while having fun with our interactive games</p>
            </div>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="animate-scale-in"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="animate-scale-in"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Gamepad2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{games.length}</p>
                  <p className="text-sm text-muted-foreground">Total Games</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Games Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.6</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">89%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search games, categories, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("name")}
              >
                Name
              </Button>
              <Button
                variant={sortBy === "rating" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("rating")}
              >
                Rating
              </Button>
              <Button
                variant={sortBy === "difficulty" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("difficulty")}
              >
                Difficulty
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="animate-scale-in"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredGames.length} of {games.length} games
          </p>
        </div>

        {/* Games Grid/List */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
        }>
          {filteredGames.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No games found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredGames.map((game, index) => {
              const IconComponent = game.icon;
              return (
                <Card 
                  key={game.id} 
                  className={`group hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in hover-scale ${
                    viewMode === "list" ? "flex items-center p-4" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {viewMode === "grid" ? (
                    <>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-xl ${game.color} text-white shadow-lg`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <Badge className={getDifficultyColor(game.difficulty)}>
                            {game.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {game.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{game.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{game.players} players</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <span>{game.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{game.rating}/5</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            onClick={() => handlePlayGame(game.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Play Now
                          </Button>
                          <Button size="sm" variant="outline" className="hover-scale">
                            <Trophy className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${game.color} text-white shadow-lg`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {game.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{game.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {game.players}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {game.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {game.rating}
                            </span>
                            <Badge className={getDifficultyColor(game.difficulty)} size="sm">
                              {game.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handlePlayGame(game.id)}
                          className="hover-scale"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                        <Button size="sm" variant="outline" className="hover-scale">
                          <Trophy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}