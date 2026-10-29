import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VirtualKeyboard } from "@/components/games/VirtualKeyboard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { typingLessons, getUnlockedLessons, TypingLesson } from "@/data/typingLessons";
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Target,
  Zap,
  Star,
  ArrowLeft,
  Volume2,
  VolumeX,
  Lock,
  CheckCircle,
  Keyboard,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

type GameState = 'menu' | 'lesson-select' | 'instructions' | 'playing' | 'results';

export default function TypingWizard() {
  const { userRole, userName, photoUrl, signOut } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedLesson, setSelectedLesson] = useState<TypingLesson | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [currentTargetKey, setCurrentTargetKey] = useState<string>('');
  
  // User progress (in real app, this would be stored in database)
  const [userProgress, setUserProgress] = useState<{ [lessonId: number]: { accuracy: number; wpm: number; completed: boolean } }>({});

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && startTime && !isComplete) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, startTime, isComplete]);

  // Sound effects
  const playSound = useCallback((frequency: number, duration: number = 100) => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (error) {
      // Fallback: no sound
    }
  }, [soundEnabled]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  const startLesson = (lesson: TypingLesson) => {
    setSelectedLesson(lesson);
    setCurrentExerciseIndex(0);
    setCurrentText(lesson.exercises[0]);
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setIsComplete(false);
    setStartTime(Date.now());
    setEndTime(null);
    setTimeElapsed(0);
    setCurrentTargetKey(lesson.exercises[0][0]);
    setGameState('playing');
    
    // Focus input after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const resetGame = () => {
    setGameState('menu');
    setSelectedLesson(null);
    setCurrentExerciseIndex(0);
    setCurrentText('');
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setIsComplete(false);
    setStartTime(null);
    setEndTime(null);
    setTimeElapsed(0);
    setCurrentTargetKey('');
    setPressedKeys(new Set());
  };

  const nextExercise = () => {
    if (!selectedLesson) return;
    
    if (currentExerciseIndex < selectedLesson.exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setCurrentText(selectedLesson.exercises[nextIndex]);
      setUserInput('');
      setCurrentIndex(0);
      setErrors(0);
      setIsComplete(false);
      setStartTime(Date.now());
      setEndTime(null);
      setTimeElapsed(0);
      setCurrentTargetKey(selectedLesson.exercises[nextIndex][0]);
      setGameState('playing');
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Lesson completed
      const results = calculateResults();
      const newProgress = {
        ...userProgress,
        [selectedLesson.id]: {
          accuracy: results.accuracy,
          wpm: results.wpm,
          completed: true
        }
      };
      setUserProgress(newProgress);
      setGameState('results');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentChar = currentText[currentIndex];
    const inputChar = value[currentIndex];

    if (value.length > currentText.length) return;

    setUserInput(value);

    if (inputChar !== undefined) {
      if (inputChar === currentChar) {
        // Correct character
        playSound(800, 50);
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        
        // Update target key for next character
        if (newIndex < currentText.length) {
          setCurrentTargetKey(currentText[newIndex]);
        }
        
        // Check if exercise is complete
        if (value === currentText) {
          setIsComplete(true);
          setEndTime(Date.now());
          playSound(1000, 200); // Success sound
          toast.success("🎉 Exercise completed!");
          
          // Auto-advance to next exercise after a delay
          setTimeout(() => {
            nextExercise();
          }, 2000);
        }
      } else {
        // Incorrect character
        playSound(200, 150);
        setErrors(errors + 1);
      }
    }
  };

  // Handle key press for visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => new Set([...prev, e.key.toLowerCase()]));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key.toLowerCase());
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const calculateResults = () => {
    if (!startTime || !endTime) return { wpm: 0, accuracy: 0, grade: 'F' };
    
    const timeInMinutes = (endTime - startTime) / 60000;
    const wordsTyped = currentText.split(' ').length;
    const wpm = Math.round(wordsTyped / timeInMinutes);
    const accuracy = Math.round(((currentText.length - errors) / currentText.length) * 100);
    
    let grade = 'F';
    if (accuracy >= 95 && wpm >= 40) grade = 'A+';
    else if (accuracy >= 90 && wpm >= 35) grade = 'A';
    else if (accuracy >= 85 && wpm >= 30) grade = 'B';
    else if (accuracy >= 80 && wpm >= 25) grade = 'C';
    else if (accuracy >= 70 && wpm >= 20) grade = 'D';
    
    return { wpm, accuracy, grade };
  };

  const renderCharacter = (char: string, index: number) => {
    let className = "text-lg font-mono px-1 py-0.5 rounded ";
    
    if (index < userInput.length) {
      if (userInput[index] === char) {
        className += "text-green-600 bg-green-100 dark:bg-green-900/30";
      } else {
        className += "text-red-600 bg-red-100 dark:bg-red-900/30";
      }
    } else if (index === currentIndex) {
      className += "bg-primary text-primary-foreground animate-pulse";
    } else {
      className += "text-muted-foreground";
    }
    
    return (
      <span key={index} className={className}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  };

  const unlockedLessons = getUnlockedLessons(userProgress);

  return (
    <DashboardLayout userRole={userRole || "student"} userName={userName} photoUrl={photoUrl} onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/games')}
              className="hover-scale"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Typing Wizard</h1>
                <p className="text-muted-foreground">Master the magical art of typing!</p>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hover-scale"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main Menu */}
        {gameState === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Touch Typing Course
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Master touch typing through progressive lessons. Start with home row keys and advance to full keyboard mastery.
                </p>
                
                <div className="grid gap-3">
                  <Button onClick={() => setGameState('lesson-select')} className="h-auto p-4 hover-scale">
                    <div className="flex items-center gap-3">
                      <Keyboard className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Start Learning</div>
                        <div className="text-sm text-muted-foreground">Progressive typing lessons</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" onClick={() => setGameState('instructions')} className="hover-scale">
                    <BookOpen className="h-4 w-4 mr-2" />
                    How to Play
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Course Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Keyboard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Visual Keyboard</h4>
                      <p className="text-sm text-muted-foreground">Interactive keyboard with finger positioning guide</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Progressive Learning</h4>
                      <p className="text-sm text-muted-foreground">Structured lessons from basics to advanced</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Trophy className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Achievement System</h4>
                      <p className="text-sm text-muted-foreground">Unlock lessons as you progress</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lesson Selection */}
        {gameState === 'lesson-select' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Select a Lesson
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typingLessons.map((lesson) => {
                    const isUnlocked = unlockedLessons.includes(lesson.id);
                    const progress = userProgress[lesson.id];
                    const isCompleted = progress?.completed || false;
                    
                    return (
                      <Card 
                        key={lesson.id} 
                        className={`relative hover-scale ${!isUnlocked ? 'opacity-50' : ''}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant={lesson.difficulty === 'beginner' ? 'secondary' : lesson.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                              {lesson.difficulty}
                            </Badge>
                            {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                            {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                          <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>
                          
                          <div className="flex flex-wrap gap-1">
                            {lesson.targetKeys.slice(0, 8).map((key) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}
                              </Badge>
                            ))}
                            {lesson.targetKeys.length > 8 && (
                              <Badge variant="outline" className="text-xs">
                                +{lesson.targetKeys.length - 8}
                              </Badge>
                            )}
                          </div>
                          
                          {progress && (
                            <div className="text-xs text-muted-foreground">
                              Best: {progress.accuracy}% accuracy, {progress.wpm} WPM
                            </div>
                          )}
                          
                          <Button 
                            className="w-full" 
                            disabled={!isUnlocked}
                            onClick={() => startLesson(lesson)}
                          >
                            {isCompleted ? 'Practice Again' : 'Start Lesson'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={() => setGameState('menu')} className="hover-scale">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {gameState === 'instructions' && (
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                How to Use Typing Wizard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Learning Process:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-500/10 text-blue-600">1</Badge>
                      <p className="text-sm">Start with home row keys (ASDF JKL;)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-green-500/10 text-green-600">2</Badge>
                      <p className="text-sm">Follow finger positioning guide on keyboard</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-orange-500/10 text-orange-600">3</Badge>
                      <p className="text-sm">Complete exercises to unlock next lesson</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-purple-500/10 text-purple-600">4</Badge>
                      <p className="text-sm">Progress through all keyboard rows</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Visual Feedback:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded border"></div>
                      <span className="text-sm">Correct letters</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded border"></div>
                      <span className="text-sm">Incorrect letters</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary rounded border animate-pulse"></div>
                      <span className="text-sm">Current position</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-200 dark:bg-yellow-900/50 rounded border"></div>
                      <span className="text-sm">Finger guide colors</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Unlock Requirements:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Lesson 1 (Home Row):</span>
                      <span className="font-semibold">Always unlocked</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lesson 2 (Top Row):</span>
                      <span className="font-semibold">85% accuracy, 15 WPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lesson 3 (Bottom Row):</span>
                      <span className="font-semibold">80% accuracy, 20 WPM</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Lesson 4 (Numbers):</span>
                      <span className="font-semibold">80% accuracy, 25 WPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Advanced Lessons:</span>
                      <span className="font-semibold">Higher requirements</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setGameState('menu')} className="hover-scale">
                  Back to Menu
                </Button>
                <Button onClick={() => setGameState('lesson-select')} className="flex-1 hover-scale">
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Playing */}
        {gameState === 'playing' && selectedLesson && (
          <div className="space-y-6">
            {/* Lesson Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {selectedLesson.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Exercise {currentExerciseIndex + 1} of {selectedLesson.exercises.length}
                    </p>
                  </div>
                  <Badge variant={selectedLesson.difficulty === 'beginner' ? 'secondary' : selectedLesson.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                    {selectedLesson.difficulty}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="text-lg font-bold">{timeElapsed}s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-lg font-bold">{Math.round((currentIndex / currentText.length) * 100)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <p className="text-lg font-bold">{errors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Next Key</p>
                      <p className="text-lg font-bold">{currentTargetKey || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Virtual Keyboard */}
            <VirtualKeyboard 
              highlightedKey={currentTargetKey}
              pressedKeys={pressedKeys}
              showFingerGuide={true}
            />

            {/* Progress Bar */}
            <Card>
              <CardContent className="p-6">
                <Progress value={(currentIndex / currentText.length) * 100} className="mb-4" />
                <p className="text-center text-sm text-muted-foreground">
                  {currentIndex} of {currentText.length} characters typed
                </p>
              </CardContent>
            </Card>

            {/* Typing Area */}
            <Card>
              <CardHeader>
                <CardTitle>Type the text below:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <div className="text-center leading-relaxed text-xl">
                    {currentText.split('').map((char, index) => renderCharacter(char, index))}
                  </div>
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full p-4 text-lg font-mono bg-background border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="Start typing here..."
                  disabled={isComplete}
                />
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setGameState('lesson-select')} className="hover-scale">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Lessons
                  </Button>
                  <Button variant="outline" onClick={resetGame} className="hover-scale">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Main Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {gameState === 'results' && selectedLesson && (
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Lesson Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full text-white text-2xl font-bold mb-4">
                  {calculateResults().grade}
                </div>
                <h3 className="text-2xl font-bold mb-2">{selectedLesson.title}</h3>
                <p className="text-muted-foreground">
                  {currentExerciseIndex + 1 >= selectedLesson.exercises.length ? 
                    "Lesson completed!" : 
                    `Exercise ${currentExerciseIndex + 1} of ${selectedLesson.exercises.length} completed`
                  }
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{calculateResults().wpm}</p>
                    <p className="text-sm text-muted-foreground">Words Per Minute</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{calculateResults().accuracy}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{timeElapsed}s</p>
                    <p className="text-sm text-muted-foreground">Time Taken</p>
                  </CardContent>
                </Card>
              </div>

              {/* Unlock notification */}
              {selectedLesson && 
               calculateResults().accuracy >= selectedLesson.unlockRequirement.accuracy &&
               calculateResults().wpm >= selectedLesson.unlockRequirement.wpm && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600 font-semibold">Requirements met! Next lesson unlocked!</p>
                </div>
              )}
              
              <div className="flex gap-2">
                {currentExerciseIndex + 1 < selectedLesson.exercises.length ? (
                  <Button onClick={nextExercise} className="flex-1 hover-scale">
                    <Play className="h-4 w-4 mr-2" />
                    Next Exercise
                  </Button>
                ) : (
                  <Button onClick={() => setGameState('lesson-select')} className="flex-1 hover-scale">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Choose Another Lesson
                  </Button>
                )}
                <Button variant="outline" onClick={resetGame} className="hover-scale">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Main Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}